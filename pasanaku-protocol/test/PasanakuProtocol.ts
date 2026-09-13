import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { PasanakuProtocol, MockUSDC, UnlockMock } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const UNIT = 10n ** 18n;
const CONTRIB = 5n * UNIT; // cuota
const COLLAT = 10n * UNIT; // colateral chico (2 cuotas)
const MAX = 10n ** 30n; // approve grande
const SAVINGS = 0;
const CREDIT = 1;
const LAST_BONUS_BPS = 600n;

function earlySkim(pot: bigint, n: bigint) {
  return (pot * LAST_BONUS_BPS) / (10000n * (n - 1n));
}

describe("PasanakuProtocol", () => {
  let token: MockUSDC;
  let proto: PasanakuProtocol;
  let lock: UnlockMock;
  let deployer: HardhatEthersSigner;
  let A: HardhatEthersSigner, B: HardhatEthersSigner, C: HardhatEthersSigner, D: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;
  let fee: HardhatEthersSigner;

  beforeEach(async () => {
    [deployer, A, B, C, D, stranger, fee] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockUSDC");
    token = await Token.deploy();

    const Lock = await ethers.getContractFactory("UnlockMock");
    lock = await Lock.deploy();
    await lock.grantKeys([A.address, B.address, C.address, D.address]);

    const Proto = await ethers.getContractFactory("PasanakuProtocol");
    proto = await Proto.deploy(await token.getAddress(), fee.address, await lock.getAddress());

    const protoAddr = await proto.getAddress();
    for (const s of [A, B, C, D]) {
      await token.mint(s.address, 1000n * UNIT);
      await token.connect(s).approve(protoAddr, MAX);
    }
  });

  // Crea un círculo CREDIT [A,B,C] y hace que todos entren (join).
  async function creditCircleJoined(collateral = COLLAT) {
    await proto.createCircle([A.address, B.address, C.address], CONTRIB, collateral, CREDIT);
    const id = (await proto.circleCount()) - 1n;
    await proto.connect(A).join(id);
    await proto.connect(B).join(id);
    await proto.connect(C).join(id);
    return id;
  }

  it("1. join bloquea el colateral en el contrato", async () => {
    await proto.createCircle([A.address, B.address, C.address], CONTRIB, COLLAT, CREDIT);
    const id = (await proto.circleCount()) - 1n;
    const before = await token.balanceOf(await proto.getAddress());
    await proto.connect(A).join(id);
    const after = await token.balanceOf(await proto.getAddress());
    expect(after - before).to.equal(COLLAT);
    expect(await proto.hasCollateral(id, A.address)).to.equal(true);
  });

  it("2. no puedes contribuir sin join / sin arrancar", async () => {
    await proto.createCircle([A.address, B.address, C.address], CONTRIB, COLLAT, CREDIT);
    const id = (await proto.circleCount()) - 1n;
    await expect(proto.connect(B).contribute(id)).to.be.revertedWith("not started");
    await proto.connect(A).join(id);
    await proto.connect(B).join(id);
    await proto.connect(C).join(id);
    await expect(proto.connect(D).contribute(id)).to.be.revertedWith("join first");
  });

  it("3. CREDIT: el del turno no puede aportar su ronda", async () => {
    const id = await creditCircleJoined();
    // ronda 0 -> recipient A
    await expect(proto.connect(A).contribute(id)).to.be.revertedWith("recipient does not pay");
  });

  it("4. SAVINGS: todos aportan (incluido el del turno)", async () => {
    await proto.createCircle([A.address, B.address, C.address], CONTRIB, COLLAT, SAVINGS);
    const id = (await proto.circleCount()) - 1n;
    await proto.connect(A).join(id);
    await proto.connect(B).join(id);
    await proto.connect(C).join(id);
    // A es el "recipient" de la ronda 0 y aun asi puede aportar en modo SAVINGS
    await expect(proto.connect(A).contribute(id)).to.emit(proto, "Contributed");
    expect(await proto.hasPaid(id, 0, A.address)).to.equal(true);
  });

  it("5. no puedes cobrar sin todos los aportes", async () => {
    const id = await creditCircleJoined();
    await proto.connect(B).contribute(id); // falta C
    await expect(proto.connect(A).claim(id)).to.be.revertedWith("missing contributions");
  });

  it("6. claim acredita pot - fee - seguro y sube el fondo de seguro", async () => {
    const id = await creditCircleJoined();
    await proto.connect(B).contribute(id);
    await proto.connect(C).contribute(id);

    const pot = CONTRIB * 2n; // payers = 2 en CREDIT
    const feeAmt = (pot * 100n) / 10000n;
    const insAmt = (pot * 30n) / 10000n;
    const skim = earlySkim(pot, 3n);
    const net = pot - feeAmt - insAmt - skim;

    await proto.connect(A).claim(id);

    expect(await proto.withdrawable(A.address)).to.equal(net);
    expect(await proto.withdrawable(fee.address)).to.equal(feeAmt);
    expect(await proto.insuranceFund()).to.equal(insAmt);
    expect(await proto.getLateBonus(id)).to.equal(skim);
  });

  it("7. doble aporte revierte", async () => {
    const id = await creditCircleJoined();
    await proto.connect(B).contribute(id);
    await expect(proto.connect(B).contribute(id)).to.be.revertedWith("already paid");
  });

  it("8. markDefault slashea colateral y usa el fondo de seguro para cubrir el hueco", async () => {
    // Primero sembramos el fondo de seguro con un claim en un circulo normal.
    const seed = await creditCircleJoined();
    await proto.connect(B).contribute(seed);
    await proto.connect(C).contribute(seed);
    await proto.connect(A).claim(seed);
    const fundBefore = await proto.insuranceFund();
    expect(fundBefore).to.be.greaterThan(0n);

    // Circulo con colateral < cuota para forzar hueco cubierto por el fondo.
    const smallCollat = 3n * UNIT; // < CONTRIB (5)
    const id = await creditCircleJoined(smallCollat);
    // ronda 0 -> recipient A. B aporta, C NO.
    await proto.connect(B).contribute(id);

    const aBefore = await proto.withdrawable(A.address);
    await expect(proto.connect(B).markDefault(id, C.address)).to.emit(proto, "Defaulted");
    const aAfter = await proto.withdrawable(A.address);

    // A recibe: colateral de C (3) + lo que el fondo alcance a cubrir del hueco (min(gap, fondo))
    const gap = CONTRIB - smallCollat;
    const cover = fundBefore < gap ? fundBefore : gap;
    expect(aAfter - aBefore).to.equal(smallCollat + cover);
    expect(await proto.insuranceFund()).to.equal(fundBefore - cover);
    expect(await proto.hasCollateral(id, C.address)).to.equal(false);
    // ya fue cubierto -> segundo markDefault revierte (no se puede doble-defaultear)
    await expect(proto.connect(B).markDefault(id, C.address)).to.be.revertedWith("did pay");
  });

  it("9. ciclo completo -> finished, colateral devuelto y score +1", async () => {
    const id = await creditCircleJoined();

    // ronda 0: recipient A
    await proto.connect(B).contribute(id);
    await proto.connect(C).contribute(id);
    await proto.connect(A).claim(id);

    // ronda 1: recipient B
    await proto.connect(A).contribute(id);
    await proto.connect(C).contribute(id);
    await proto.connect(B).claim(id);

    // ronda 2: recipient C
    await proto.connect(A).contribute(id);
    await proto.connect(B).contribute(id);
    await proto.connect(C).claim(id);

    expect(await proto.isFinished(id)).to.equal(true);
    expect(await proto.score(A.address)).to.equal(1n);
    expect(await proto.score(B.address)).to.equal(1n);
    expect(await proto.score(C.address)).to.equal(1n);
    // colateral se devolvio (esta acreditado para withdraw)
    expect(await proto.withdrawable(A.address)).to.be.greaterThanOrEqual(COLLAT);
  });

  it("10. recover solo tras el timeout y devuelve el colateral", async () => {
    const id = await creditCircleJoined();
    await expect(proto.connect(A).recover(id)).to.be.revertedWith("not stuck yet");

    await time.increase(7 * 24 * 60 * 60 + 1); // > RECOVER_TIMEOUT

    const before = await proto.withdrawable(A.address);
    await expect(proto.connect(A).recover(id)).to.emit(proto, "Recovered");
    const after = await proto.withdrawable(A.address);
    expect(after - before).to.equal(COLLAT);
    expect(await proto.hasCollateral(id, A.address)).to.equal(false);
  });

  it("11. withdraw transfiere y deja withdrawable en 0", async () => {
    const id = await creditCircleJoined();
    await proto.connect(B).contribute(id);
    await proto.connect(C).contribute(id);
    await proto.connect(A).claim(id);

    const credited = await proto.withdrawable(A.address);
    expect(credited).to.be.greaterThan(0n);

    const balBefore = await token.balanceOf(A.address);
    await proto.connect(A).withdraw();
    const balAfter = await token.balanceOf(A.address);

    expect(balAfter - balBefore).to.equal(credited);
    expect(await proto.withdrawable(A.address)).to.equal(0n);
  });

  it("12. markDefault revierte en modo SAVINGS", async () => {
    await proto.createCircle([A.address, B.address, C.address], CONTRIB, COLLAT, SAVINGS);
    const id = (await proto.circleCount()) - 1n;
    await proto.connect(A).join(id);
    await proto.connect(B).join(id);
    await proto.connect(C).join(id);
    await expect(proto.connect(A).markDefault(id, B.address)).to.be.revertedWith("no default in savings");
  });

  it("13. el último recibe el bono acumulado (~6% de un pozo)", async () => {
    const id = await creditCircleJoined();
    const n = 3n;
    const pot = CONTRIB * 2n;
    const feeAmt = (pot * 100n) / 10000n;
    const insAmt = (pot * 30n) / 10000n;
    const skim = earlySkim(pot, n);

    // ronda 0: A cobra temprano (paga el recorte)
    await proto.connect(B).contribute(id);
    await proto.connect(C).contribute(id);
    await proto.connect(A).claim(id);
    expect(await proto.getLateBonus(id)).to.equal(skim);

    // ronda 1: B también temprano
    await proto.connect(A).contribute(id);
    await proto.connect(C).contribute(id);
    await proto.connect(B).claim(id);
    expect(await proto.getLateBonus(id)).to.equal(skim * 2n);

    // ronda 2: C cierra y se lleva pozo + bono (sin recorte)
    const cBefore = await proto.withdrawable(C.address);
    await proto.connect(A).contribute(id);
    await proto.connect(B).contribute(id);
    await proto.connect(C).claim(id);

    const expectedNet = pot - feeAmt - insAmt + skim * 2n;
    expect((await proto.withdrawable(C.address)) - cBefore).to.equal(expectedNet + COLLAT); // + colateral al finished
    expect(await proto.getLateBonus(id)).to.equal(0n);
    expect(await proto.isFinished(id)).to.equal(true);
    // 2 recortes = 6% de un pozo
    expect(skim * 2n).to.equal((pot * LAST_BONUS_BPS) / 10000n);
  });

  it("14. join revierte sin membresía Unlock", async () => {
    await proto.createCircle([A.address, B.address, stranger.address], CONTRIB, COLLAT, CREDIT);
    const id = (await proto.circleCount()) - 1n;
    await token.mint(stranger.address, 1000n * UNIT);
    await token.connect(stranger).approve(await proto.getAddress(), MAX);
    await expect(proto.connect(stranger).join(id)).to.be.revertedWith("no membership");
    await lock.setHasValidKey(stranger.address, true);
    await expect(proto.connect(stranger).join(id)).to.emit(proto, "Joined");
  });

  it("15. createCircle rechaza miembros duplicados o cero", async () => {
    await expect(
      proto.createCircle([A.address, B.address, A.address], CONTRIB, COLLAT, CREDIT),
    ).to.be.revertedWith("dup member");
    await expect(
      proto.createCircle([A.address, B.address, ethers.ZeroAddress], CONTRIB, COLLAT, CREDIT),
    ).to.be.revertedWith("zero member");
  });

  it("16. ronda avanza y el colateral no se suelta hasta el cierre", async () => {
    const id = await creditCircleJoined();
    expect(await proto.getRound(id)).to.equal(0n);

    await proto.connect(B).contribute(id);
    await proto.connect(C).contribute(id);
    await proto.connect(A).claim(id);

    expect(await proto.getRound(id)).to.equal(1n);
    expect(await proto.hasCollateral(id, A.address)).to.equal(true);
    expect(await proto.hasCollateral(id, B.address)).to.equal(true);
    expect(await proto.recipient(id)).to.equal(B.address);

    await proto.connect(A).contribute(id);
    await proto.connect(C).contribute(id);
    await proto.connect(B).claim(id);
    expect(await proto.getRound(id)).to.equal(2n);
    expect(await proto.recipient(id)).to.equal(C.address);
    expect(await proto.hasCollateral(id, C.address)).to.equal(true);
  });

  it("17. join con colateral 0; join tras finished revierte", async () => {
    await proto.createCircle([A.address, B.address, C.address], CONTRIB, 0, CREDIT);
    const id = (await proto.circleCount()) - 1n;
    await proto.connect(A).join(id);
    await proto.connect(B).join(id);
    await proto.connect(C).join(id);
    expect(await proto.hasCollateral(id, A.address)).to.equal(true);
    expect(await token.balanceOf(await proto.getAddress())).to.equal(0n);

    await proto.connect(B).contribute(id);
    await proto.connect(C).contribute(id);
    await proto.connect(A).claim(id);
    await proto.connect(A).contribute(id);
    await proto.connect(C).contribute(id);
    await proto.connect(B).claim(id);
    await proto.connect(A).contribute(id);
    await proto.connect(B).contribute(id);
    await proto.connect(C).claim(id);
    expect(await proto.isFinished(id)).to.equal(true);
    await expect(proto.connect(A).join(id)).to.be.revertedWith("finished");
  });

  it("18. leave en pending devuelve colateral; no leave si ya arrancó", async () => {
    await proto.createCircle([A.address, B.address, C.address], CONTRIB, COLLAT, CREDIT);
    const id = (await proto.circleCount()) - 1n;
    expect(await proto.phase(id)).to.equal(0n); // pending
    await proto.connect(A).join(id);
    const before = await proto.withdrawable(A.address);
    await expect(proto.connect(A).leave(id)).to.emit(proto, "Left");
    expect((await proto.withdrawable(A.address)) - before).to.equal(COLLAT);
    expect(await proto.hasJoined(id, A.address)).to.equal(false);

    await proto.connect(A).join(id);
    await proto.connect(B).join(id);
    await proto.connect(C).join(id);
    expect(await proto.phase(id)).to.equal(2n); // vivo
    await expect(proto.connect(A).leave(id)).to.be.revertedWith("already started");
  });

  it("19. stale bloquea join y deja leave", async () => {
    await proto.createCircle([A.address, B.address, C.address], CONTRIB, COLLAT, CREDIT);
    const id = (await proto.circleCount()) - 1n;
    await proto.connect(A).join(id);
    await time.increase(7 * 24 * 60 * 60 + 1);
    expect(await proto.phase(id)).to.equal(1n); // stale
    await expect(proto.connect(B).join(id)).to.be.revertedWith("stale");
    await expect(proto.connect(A).leave(id)).to.emit(proto, "Left");
  });

  it("20. contributeFor: D paga la cuota de B", async () => {
    const id = await creditCircleJoined();
    await token.mint(D.address, 1000n * UNIT);
    await token.connect(D).approve(await proto.getAddress(), MAX);
    await expect(proto.connect(D).contributeFor(id, B.address)).to.emit(proto, "Contributed");
    expect(await proto.hasPaid(id, 0, B.address)).to.equal(true);
    await proto.connect(C).contribute(id);
    await proto.connect(A).claim(id);
    expect(await proto.getRound(id)).to.equal(1n);
  });

  it("21. default parcial: el círculo sigue y claim usa solo lo aportado", async () => {
    const id = await creditCircleJoined();
    await proto.connect(B).contribute(id);
    await proto.connect(A).markDefault(id, C.address);

    const pot = CONTRIB; // solo B aportó tokens
    const feeAmt = (pot * 100n) / 10000n;
    const insAmt = (pot * 30n) / 10000n;
    const skim = earlySkim(pot, 3n);
    const aBefore = await proto.withdrawable(A.address);
    await proto.connect(A).claim(id);
    expect((await proto.withdrawable(A.address)) - aBefore).to.equal(pot - feeAmt - insAmt - skim);
    expect(await proto.getRound(id)).to.equal(1n);
    expect(await proto.phase(id)).to.equal(2n);
  });
});
