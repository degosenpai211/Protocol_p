import { ethers } from "hardhat";

/**
 * Ciclo A→B→C en Hardhat (sin Fuji, sin wallet).
 * CREDIT: B y C aportan, A cobra ronda 0, colateral queda trabado hasta el cierre.
 */
async function main() {
  const UNIT = 10n ** 18n;
  const CONTRIB = 5n * UNIT;
  const COLLAT = 10n * UNIT;
  const [, A, B, C, fee] = await ethers.getSigners();

  const token = await (await ethers.getContractFactory("MockUSDC")).deploy();
  const lock = await (await ethers.getContractFactory("UnlockMock")).deploy();
  await lock.grantKeys([A.address, B.address, C.address]);
  const proto = await (
    await ethers.getContractFactory("PasanakuProtocol")
  ).deploy(await token.getAddress(), fee.address, await lock.getAddress());

  for (const s of [A, B, C]) {
    await token.mint(s.address, 1000n * UNIT);
    await token.connect(s).approve(await proto.getAddress(), ethers.MaxUint256);
  }

  await proto.createCircle([A.address, B.address, C.address], CONTRIB, COLLAT, 1);
  const id = 0n;
  await proto.connect(A).join(id);
  await proto.connect(B).join(id);
  await proto.connect(C).join(id);

  await proto.connect(B).contribute(id);
  await proto.connect(C).contribute(id);
  await proto.connect(A).claim(id);
  const afterR0 = await proto.getCircle(id);
  console.log("ronda tras cobro A:", afterR0[3].toString(), "(debe ser 1)");
  console.log("bono último:", ethers.formatEther(afterR0[7]));

  await proto.connect(A).contribute(id);
  await proto.connect(C).contribute(id);
  await proto.connect(B).claim(id);

  await proto.connect(A).contribute(id);
  await proto.connect(B).contribute(id);
  await proto.connect(C).claim(id);

  const done = await proto.getCircle(id);
  console.log("finished:", done[6]);
  console.log("score C:", (await proto.score(C.address)).toString());
  await proto.connect(C).withdraw();
  console.log("ciclo A-B-C OK");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
