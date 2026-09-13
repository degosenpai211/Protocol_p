import { ethers, run, network } from "hardhat";

/** Lock Unlock REAL en C-Chain. No UnlockMock. */
const UNLOCK_LOCK =
  process.env.UNLOCK_LOCK || "0x6f8474145F4DA3A1987FdaCf4930C8c62A974303";

const DEMO = [
  process.env.DEMO_A || "0x32baA1d37eFcDB7df273afE743565E54aF1E6371",
  process.env.DEMO_B || "0x3919FE68971c28466C761769a02020011086b85b",
  process.env.DEMO_C || "0xB19d31205375D92b29BC8EA2A413C7411CF861D6",
];

async function main() {
  if (network.name !== "avalanche") {
    throw new Error("Este script es solo C-Chain. Usá --network avalanche");
  }

  const [deployer] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("AVAX:", ethers.formatEther(bal));
  console.log("Unlock lock:", UNLOCK_LOCK);

  if (bal < ethers.parseEther("0.02")) {
    throw new Error("Poco AVAX en C-Chain. Mandá ~0.05 AVAX a la wallet A y reintentá.");
  }

  const Token = await ethers.getContractFactory("MockUSDC");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("MockUSDC:", tokenAddr);

  const Proto = await ethers.getContractFactory("PasanakuProtocol");
  const proto = await Proto.deploy(tokenAddr, deployer.address, UNLOCK_LOCK);
  await proto.waitForDeployment();
  const protoAddr = await proto.getAddress();
  console.log("PasanakuProtocol:", protoAddr);

  const amount = 1000n * 10n ** 18n;
  const unique = [...new Set([deployer.address, ...DEMO])];
  for (const addr of unique) {
    await (await token.mint(addr, amount)).wait();
  }
  console.log("Minteados 1000 mUSDC a A/B/C");

  console.log("\nSnowtrace:");
  console.log(`https://snowtrace.io/address/${protoAddr}`);
  console.log("\nPegá en web/.env.local si el mentor pide C-Chain:");
  console.log(`NEXT_PUBLIC_CHAIN_ID=43114`);
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddr}`);
  console.log(`NEXT_PUBLIC_PROTOCOL_ADDRESS=${protoAddr}`);
  console.log(`NEXT_PUBLIC_UNLOCK_LOCK=${UNLOCK_LOCK}`);

  console.log("\nEsperando confirmaciones para verificar...");
  await proto.deploymentTransaction()?.wait(5);
  try {
    await run("verify:verify", { address: tokenAddr, constructorArguments: [] });
    await run("verify:verify", {
      address: protoAddr,
      constructorArguments: [tokenAddr, deployer.address, UNLOCK_LOCK],
    });
    console.log("Verificados en Snowtrace.");
  } catch (e) {
    console.log("Verificación falló (podés reintentar a mano):", e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
