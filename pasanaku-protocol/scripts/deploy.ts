import { ethers, run, network } from "hardhat";

const DEMO = [
  process.env.DEMO_A || "0x32baA1d37eFcDB7df273afE743565E54aF1E6371",
  process.env.DEMO_B || "0x3919FE68971c28466C761769a02020011086b85b",
  process.env.DEMO_C || "0xB19d31205375D92b29BC8EA2A413C7411CF861D6",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address, "en", network.name);

  const Token = await ethers.getContractFactory("MockUSDC");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("MockUSDC:", tokenAddr);

  // En Fuji no hay Unlock oficial. Se despliega UnlockMock y se grantan A/B/C
  // para que join() funcione. El lock de C-Chain (bounty Unlock) es otro address.
  const Lock = await ethers.getContractFactory("UnlockMock");
  const mock = await Lock.deploy();
  await mock.waitForDeployment();
  const lockAddr = await mock.getAddress();
  await (await mock.grantKeys(DEMO)).wait();
  console.log("UnlockMock (Fuji join):", lockAddr);

  const Proto = await ethers.getContractFactory("PasanakuProtocol");
  const proto = await Proto.deploy(tokenAddr, deployer.address, lockAddr);
  await proto.waitForDeployment();
  const protoAddr = await proto.getAddress();
  console.log("PasanakuProtocol:", protoAddr);

  const amount = 1000n * 10n ** 18n;
  for (const addr of [deployer.address, ...DEMO]) {
    await (await token.mint(addr, amount)).wait();
  }
  console.log("Minteados 1000 mUSDC a deployer + A/B/C");

  console.log("\nPegá en web/.env.local:");
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddr}`);
  console.log(`NEXT_PUBLIC_PROTOCOL_ADDRESS=${protoAddr}`);
  console.log("# NEXT_PUBLIC_UNLOCK_LOCK=  <- lock REAL de C-Chain (dashboard Unlock)");

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nEsperando confirmaciones para verificar...");
    await proto.deploymentTransaction()?.wait(5);
    try {
      await run("verify:verify", { address: tokenAddr, constructorArguments: [] });
      await run("verify:verify", { address: lockAddr, constructorArguments: [] });
      await run("verify:verify", {
        address: protoAddr,
        constructorArguments: [tokenAddr, deployer.address, lockAddr],
      });
      console.log("Verificados en Snowtrace.");
    } catch (e) {
      console.log("Verificacion fallo (podés verificar a mano):", e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
