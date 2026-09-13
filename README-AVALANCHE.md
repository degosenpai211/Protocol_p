# Avalanche — el riel es el contrato

El pozo, turnos, colateral, seguro, claim, recover y bono ~6% al último viven en **PasanakuProtocol.sol**. No es un stamp.

## Por qué Avalanche

Unlock ya está en C-Chain. EVM, gas bajo, verificación Snowtrace. Fuji (43113) para la demo con MockUSDC; C-Chain si el mentor lo exige.

## Contratos (Fuji)

Pegá después de `npm run deploy:fuji`:

| | Address |
|---|---|
| MockUSDC | `0xaABC7cBEd63e8dEE6b32bBd428c423494205145f` |
| UnlockMock (join en Fuji) | `0x194cfB51bd3921e35B5800a886Cf673a13F079Cc` |
| PasanakuProtocol | `0xF6a9f97E700a0901609bFa425BBc5c71d2f7b25C` |

Explorer: https://testnet.snowtrace.io/address/0xF6a9f97E700a0901609bFa425BBc5c71d2f7b25C

## Tests

```bash
cd pasanaku-protocol
npm test
```

17 tests, incluido “sin membresía no hay join”, rondas y colateral.

SDK (túnel): `pasanaku-protocol/sdk/` — createCircle, join, contribute, claim, withdraw, getState.

## Gate demo

1 ronda real en Fuji desde `/app`: B y C aportan, A cobra, la barra del bono sube. Sin `withdrawAll`.
