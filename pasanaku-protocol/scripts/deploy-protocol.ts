import { ethers, network } from "hardhat";

const TOKEN = process.env.REUSE_TOKEN || "0xaABC7cBEd63e8dEE6b32bBd428c423494205145f";
const LOCK = process.env.REUSE_LOCK || "0x194cfB51bd3921e35B5800a886Cf673a13F079Cc";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address, "en", network.name);
  console.log("Reusa MockUSDC:", TOKEN);
  console.log("Reusa UnlockMock:", LOCK);

  const Proto = await ethers.getContractFactory("PasanakuProtocol");
  const proto = await Proto.deploy(TOKEN, deployer.address, LOCK);
  await proto.waitForDeployment();
  const protoAddr = await proto.getAddress();
  console.log("PasanakuProtocol:", protoAddr);
  console.log(`NEXT_PUBLIC_PROTOCOL_ADDRESS=${protoAddr}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
