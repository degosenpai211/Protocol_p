# Avalanche — el riel es el contrato

El pozo, turnos, colateral, seguro, claim, recover y bono ~6% al último viven en **PasanakuProtocol.sol**. No es un stamp.

## Por qué Avalanche

Unlock ya está en C-Chain. EVM, gas bajo, verificación Snowtrace. Fuji (43113) para la ronda demo barata; **C-Chain (43114)** es el deploy del bounty.

## Contratos (Avalanche C-Chain)

`npm run deploy:avalanche` — MockUSDC + protocolo. El lock es el Unlock **real**.

| | Address |
|---|---|
| MockUSDC | `0xF6a9f97E700a0901609bFa425BBc5c71d2f7b25C` |
| PasanakuProtocol | `0x3ef3910e476eC2Df6717a0438493Db85289e76A4` |
| Unlock lock (C-Chain) | `0x6f8474145F4DA3A1987FdaCf4930C8c62A974303` |

Explorer: https://snowtrace.io/address/0x3ef3910e476eC2Df6717a0438493Db85289e76A4

`join()` pide Key de ese lock. A/B/C ya tienen 1000 mUSDC minteados.

## Contratos (Fuji · demo)

| | Address |
|---|---|
| MockUSDC | `0xaABC7cBEd63e8dEE6b32bBd428c423494205145f` |
| UnlockMock (join en Fuji) | `0x194cfB51bd3921e35B5800a886Cf673a13F079Cc` |
| PasanakuProtocol | `0xF62Dcf355FF1f732A7B3226b1Cb7AFEDfdBA946B` |

Explorer: https://testnet.snowtrace.io/address/0xF62Dcf355FF1f732A7B3226b1Cb7AFEDfdBA946B

## Tests

```bash
cd pasanaku-protocol
npm test
```

21 tests: leave en pending, stale 7d, contributeFor, default parcial (el círculo sigue).

SDK: createCircle, join, leave, contribute, contributeFor, claim, markDefault, recover, withdraw, getState.

Roadmap (no este finde): shuffle de turnos con `prevrandao` + subasta ROSCASH. El guion A→B→C queda fijo.

## Gate demo

1 ronda real en Fuji desde `/app`: B y C aportan, A cobra, la barra del bono sube. Sin `withdrawAll`.
