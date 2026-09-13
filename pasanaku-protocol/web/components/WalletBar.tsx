"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { MembershipBadge } from "@/components/MembershipBadge";
import { targetChain } from "@/lib/chain";
import { demoLetter } from "@/lib/demo";

const fujiChainIdHex = `0x${targetChain.id.toString(16)}`;

export function WalletBar() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const injected = connectors[0];
  const onFuji = isConnected && chainId === targetChain.id;
  const letter = demoLetter(address);

  async function conectar() {
    if (!injected) return;
    try {
      await connect({ connector: injected });
    } catch {
      const eth = (window as unknown as { ethereum?: { request: (a: unknown) => Promise<unknown> } }).ethereum;
      await eth?.request({ method: "eth_requestAccounts" });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MembershipBadge />
      {isConnected && !onFuji && (
        <button
          onClick={async () => {
            try {
              await switchChain({ chainId: targetChain.id });
            } catch {
              const eth = (
                window as unknown as {
                  ethereum?: { request: (a: unknown) => Promise<unknown> };
                }
              ).ethereum;
              await eth?.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: fujiChainIdHex,
                    chainName: targetChain.name,
                    nativeCurrency: targetChain.nativeCurrency,
                    rpcUrls: [...targetChain.rpcUrls.default.http],
                    blockExplorerUrls: [targetChain.blockExplorers.default.url],
                  },
                ],
              });
            }
          }}
          className="btn bg-num text-canvas"
        >
          Fuji
        </button>
      )}
      {onFuji && (
        <span className="rounded-full bg-mint px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-num">
          Fuji
        </span>
      )}
      {isConnected ? (
        <button
          onClick={() => disconnect()}
          className="rounded-full border border-line bg-card px-4 py-2 font-mono text-xs"
        >
          {letter ? `${letter} · ` : ""}
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </button>
      ) : (
        <button disabled={!injected || isPending} onClick={conectar} className="btn bg-ink text-canvas">
          Conectar
        </button>
      )}
    </div>
  );
}
