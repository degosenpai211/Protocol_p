# Qué tenés que hacer vos (manual)

No creés más wallets: A, B y C alcanzan. **No hay fase 10** en el plan (termina en la 9: entregas). El guion del video está en `guion-demo.md`.

## Fase 7 (ronda 0 en Fuji)
En `/app`, red Fuji:
1. A: crear círculo, mint 500 mUSDC, aprobar, **Entrar**.
2. B: mint, aprobar, join, **Aportar**. Tiene que verse “pagó”.
3. C: igual, **Aportar**.
4. A: **Cobrar turno**. La barra de oro sube. **Retirar**.
5. Copiá el link Snowtrace de la tx de B → `README-AVALANCHE.md`.

## Fase 8 (Pollar)
1. `pub_testnet_` ya está en `.env.local`. Falta destino Stellar `G…` en `NEXT_PUBLIC_POLLAR_DESTINO`.
   En [dashboard.pollar.xyz](https://dashboard.pollar.xyz) → tu app → **Allowed domains**: `http://localhost:3000` (sin esto, Google da 403).
2. `/join`: Google → **Pagar** 1 USDC en **testnet** (probar).
3. Mainnet **una vez**: `NEXT_PUBLIC_POLLAR_NETWORK=mainnet`, `pub_mainnet_`, `NEXT_PUBLIC_POLLAR_MAINNET_ARMED=true`. Un solo $1. Hash grande → `README-POLLAR.md`. No repitas.
4. Grant Key Unlock a quien pagó, si no la tiene.

## Fase 9 (entregas, 13 sep / Unlock 18 sep)
Completá `_` en `entregas.md` y mandá Telegram Pollar, Avalanche (contrato verificado) y Unlock (lock + video muro). Deploy del front (Netlify) cuando tengas URL.
