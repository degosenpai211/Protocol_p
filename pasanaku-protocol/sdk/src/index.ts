import {
  type Address,
  type PublicClient,
  type WalletClient,
} from "viem";

/** ABI mínimo del túnel. Misma superficie que PasanakuProtocol.sol. */
export const protocolAbi = [
  {
    type: "function",
    name: "createCircle",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_members", type: "address[]" },
      { name: "_contribution", type: "uint256" },
      { name: "_collateral", type: "uint256" },
      { name: "_mode", type: "uint8" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "join",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "contribute",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "recover",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "markDefault",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "defaulter", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getCircle",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "members", type: "address[]" },
      { name: "contribution", type: "uint256" },
      { name: "collateral", type: "uint256" },
      { name: "round", type: "uint256" },
      { name: "lastAction", type: "uint256" },
      { name: "mode", type: "uint8" },
      { name: "finished", type: "bool" },
      { name: "lateBonus", type: "uint256" },
    ],
  },
] as const;

export type PasanakuClients = {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocol: Address;
};

export function createPasanaku({ publicClient, walletClient, protocol }: PasanakuClients) {
  const account = () => {
    const a = walletClient.account;
    if (!a) throw new Error("wallet sin account");
    return a;
  };

  return {
    createCircle(
      members: Address[],
      contribution: bigint,
      collateral: bigint,
      mode: 0 | 1,
    ) {
      return walletClient.writeContract({
        account: account(),
        chain: walletClient.chain,
        address: protocol,
        abi: protocolAbi,
        functionName: "createCircle",
        args: [members, contribution, collateral, mode],
      });
    },
    join(id: bigint) {
      return walletClient.writeContract({
        account: account(),
        chain: walletClient.chain,
        address: protocol,
        abi: protocolAbi,
        functionName: "join",
        args: [id],
      });
    },
    contribute(id: bigint) {
      return walletClient.writeContract({
        account: account(),
        chain: walletClient.chain,
        address: protocol,
        abi: protocolAbi,
        functionName: "contribute",
        args: [id],
      });
    },
    claim(id: bigint) {
      return walletClient.writeContract({
        account: account(),
        chain: walletClient.chain,
        address: protocol,
        abi: protocolAbi,
        functionName: "claim",
        args: [id],
      });
    },
    withdraw() {
      return walletClient.writeContract({
        account: account(),
        chain: walletClient.chain,
        address: protocol,
        abi: protocolAbi,
        functionName: "withdraw",
        args: [],
      });
    },
    recover(id: bigint) {
      return walletClient.writeContract({
        account: account(),
        chain: walletClient.chain,
        address: protocol,
        abi: protocolAbi,
        functionName: "recover",
        args: [id],
      });
    },
    markDefault(id: bigint, defaulter: Address) {
      return walletClient.writeContract({
        account: account(),
        chain: walletClient.chain,
        address: protocol,
        abi: protocolAbi,
        functionName: "markDefault",
        args: [id, defaulter],
      });
    },
    getState(id: bigint) {
      return publicClient.readContract({
        address: protocol,
        abi: protocolAbi,
        functionName: "getCircle",
        args: [id],
      });
    },
  };
}
