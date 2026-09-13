# Unlock — portal token-gated (Riel)

**No es WordPress.** Es un portal de gremio: sin Key no ves reglamento, score ni el bono del 6%. `join()` del contrato también exige `getHasValidKey`.

## Lock

- Red: **Avalanche C-Chain (43114)** (factory oficial; Unlock no está en Fuji).
- Nombre: Membresía Gremio Riel
- Precio: **0** (el cobro lo hace Pollar, 1 USDC Stellar)
- Duración: 30 días
- Factory: `0x70cBE5F72dD85aA634d07d2227a421144Af734b3`

**Address del lock:** `NEXT_PUBLIC_UNLOCK_LOCK` en `pasanaku-protocol/web/.env.local`

Pegá acá al crear: `0x6f8474145F4DA3A1987FdaCf4930C8c62A974303`

Snowtrace: `https://snowtrace.io/address/0x6f8474145F4DA3A1987FdaCf4930C8c62A974303`

## Flujo (video)

1. Wallet sin Key → `/portal` = muro.
2. `/join` → pago Pollar → grant Key.
3. Misma wallet en `/portal` → reglamento + reputación + cómo funciona el 6%.

URL del portal: `/portal` (cuando esté deployado el front).

## Chequeo

`getHasValidKey(A/B/C) === true`. Un extraño: `false`.
