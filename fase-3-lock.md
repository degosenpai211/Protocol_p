# Fase 3 — Lock Unlock

Fuente: `plan-avalanche-unlock-pollar.md` §10. **No hay `/portal` todavía** (fase 4).

**Gate:** `getHasValidKey(A/B/C) === true` y un extraño `false`.

---

## Importante: no es Fuji

Unlock **no tiene factory oficial en Fuji (43113)**. El address del plan es C-Chain mainnet:

`0x70cBE5F72dD85aA634d07d2227a421144Af734b3`

| Pieza | Chain | Por qué |
|---|---|---|
| Lock “Membresía Gremio Riel” | **Avalanche C-Chain 43114** | Factory Unlock oficial. Precio de la Key = **0** (cobra Pollar). |
| Pozo / MockUSDC / estudio | Fuji 43113 | Demo barata. Deploy del protocolo = fase 6. |

Crear el lock gasta **un poco de AVAX real** (gas, no el precio de la Key). Sale del presupuesto de ~$5. Las Keys a A/B/C son grant: **$0**.

En MetaMask, wallet **A** necesita AVAX en **C-Chain** (no el del faucet Fuji). Si A solo tiene testnet, comprá ~$1–2 de AVAX y mandalo a A en 43114.

---

## 1. Crear el lock (dashboard)

1. Abrí [app.unlock-protocol.com](https://app.unlock-protocol.com) con **wallet A**.
2. Red: **Avalanche** (C-Chain). Si ves Fuji / HSK, cambialo.
3. **Create Lock** / crear membresía.
4. Datos:

| Campo | Valor |
|---|---|
| Name | `Membresía Gremio Riel` |
| Price | **0** (Free) |
| Duration | **30 days** |
| Quantity | Unlimited (o 52) |
| Currency | Native AVAX (da igual: precio 0) |

5. Firmá. Copiá el **lock address** (`0x…`) a `pasanaku-protocol/web/.env.local`:

```
NEXT_PUBLIC_UNLOCK_LOCK=0xTU_LOCK
NEXT_PUBLIC_UNLOCK_CHAIN_ID=43114
```

Lock en Snowtrace: `https://snowtrace.io/address/0xTU_LOCK`

- [ ] Lock creado
- Address:

---

## 2. Grant Keys a A, B, C

En el dashboard del lock: **Airdrop** / Grant membership. Pegá las 3 addresses Fuji/C-Chain (la misma `0x` sirve en ambas). Duration 30 días. Firmá **una** tx (sigue siendo $0 de Key, solo gas).

No grants a wallets random: el extraño tiene que dar `false`.

- [ ] Key a A
- [ ] Key a B
- [ ] Key a C

---

## 3. Verificar el gate

**Snowtrace → Contract → Read → `getHasValidKey`:**

- A, B, C → `true`
- Cualquier address que no hayas grantado → `false`

**UI:** con `NEXT_PUBLIC_UNLOCK_LOCK` en `.env.local`, `npm run dev`, conectá A. El header muestra **Key válida**. Con una cuenta sin grant: **Sin Key**.

(La lectura va a C-Chain aunque el resto de la UI esté en Fuji.)

---

## Qué no hacer

- No crear el lock en Fuji: no hay Unlock oficial ahí.
- No poner precio > 0: cobra Pollar, no el lock.
- No armar `/portal` todavía (fase 4).
- No gastar el 1 USDC de Pollar.

Cuando A/B/C den `true`, fase 4: muro token-gated.
