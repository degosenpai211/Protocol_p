# Fase 1 — Trámites

Fuente: `plan-avalanche-unlock-pollar.md` §10. **No hay código en esta fase.**

**Gate para pasar a fase 2:** wallets A, B y C con AVAX en Fuji **y** formulario Pollar enviado.

Marca con `[x]` cuando termines cada ítem.

---

## 0. Tres wallets MetaMask (A / B / C)

En MetaMask: cuenta A (la que ya usas) + **Crear cuenta** dos veces → B y C.

Añade **Avalanche Fuji C-Chain**:

| Campo | Valor |
|---|---|
| Network name | Avalanche Fuji C-Chain |
| RPC | `https://api.avax-test.network/ext/bc/C/rpc` |
| Chain ID | `43113` |
| Symbol | `AVAX` |
| Explorer | `https://testnet.snowtrace.io` |

Anota addresses (empiezan con `0x`):

| Wallet | Address Fuji |
|---|---|
| A (organizer, faucet, deploy) | |
| B (aporta en demo) | |
| C (aporta en demo) | |

No pegues private keys en este archivo ni en el chat.

---

## 1. Formulario Pollar mainnet

El bounty pide **formulario mainnet el día 1**. No es un formulario de aprobación técnica de Pollar (su docs dicen que no hay approval). Es el formulario del **track local**.

1. Entrá al grupo: [Telegram bounty Pollar](https://t.me/+gNDhgPjIqwY2Yjgx)
2. Pedí / buscá el form de mainnet / inscripción del bounty.
3. Enviá con: nombre del proyecto **Riel Pasanaku**, idea (rampa 1 USDC para activar gremio; el pozo vive en Avalanche, **sin bridge**).

Pegá aquí cuando esté:

- [ ] Form enviado
- Fecha:
- Link o captura (ruta local, no hace falta subirla):

---

## 2. API key Pollar

Docs: [API Keys](https://docs.pollar.xyz/docs/getting-started/api-keys) · Dashboard: [dashboard.pollar.xyz](https://dashboard.pollar.xyz)

1. Sign in (Google / GitHub / email).
2. Creá una app, p. ej. `Riel Pasanaku`.
3. **Build → API Keys → Generate**.
4. Hoy: **`pub_testnet_`** (desarrollo). La `pub_mainnet_` se genera en fase 8, **una sola** tx de 1 USDC.
5. Guardá `pub_testnet_…` en `web/.env.local` (copiá `.env.example`). **Nunca** `NEXT_PUBLIC_` en una `sec_*`.
6. Destino del pago (fase 8): tu address Stellar `G…` o la que indique el bounty → `NEXT_PUBLIC_POLLAR_DESTINO`.

- [ ] App creada en dashboard
- [x] `pub_testnet_` generada y guardada en `.env.local` (no en git)
- Prefijo que ves (sin pegar la key): `pub_testnet_` / `pub_mainnet_`

---

## 3. Faucet Fuji

Faucet oficial: [build.avax.network faucet](https://build.avax.network/console/primary-network/faucet)

1. Conectá **wallet A** (Core o MetaMask en Fuji).
2. Pedí AVAX testnet.
3. Desde A, mandá un poco a B y a C (p. ej. 0.5–1 AVAX c/u). Gas de demo.

Si el faucet pide Core: [core.app testnet faucet](https://core.app/tools/testnet-faucet/).

Comprobá en [testnet.snowtrace.io](https://testnet.snowtrace.io).

- [ ] A tiene AVAX Fuji
- [ ] B tiene AVAX Fuji
- [ ] C tiene AVAX Fuji

---

## 4. Mentor Avalanche (preguntar hoy)

Cierra **13 sep**. Pregunta dura del plan: ¿Fuji (43113) verificado en Snowtrace testnet alcanza, o exigen C-Chain mainnet (43114) y se van los $5 de gas?

Pegá esto:

```
Hola — track Avalanche, proyecto Riel Pasanaku (ROSCA no-custodio).

El pozo, turnos, colateral, seguro, claim y recover viven en el contrato (no es un stamp). Unlock Lock también en Avalanche.

Pregunta: ¿un deploy verificado en Fuji (43113) + ronda real desde la UI alcanza para el bounty, o exigen C-Chain mainnet (43114) verificado en snowtrace.io?

Si Fuji vale, demo ahí con MockUSDC. Si exigen 43114, ajustamos gas (presupuesto ~$5).
```

- [ ] Pregunta enviada
- Respuesta (Fuji / C-Chain / aún no):

---

## 5. Unlock (confirmar el gate, no crear el lock todavía)

El lock se crea en **fase 3** (precio 0, 30 días, grant a A/B/C). Hoy solo confirmar criterio.

Unlock dashboard (para más tarde): [app.unlock-protocol.com](https://app.unlock-protocol.com)  
Factory Avalanche: `0x70cBE5F72dD85aA634d07d2227a421144Af734b3`

Pregunta al mentor Unlock:

```
Hola — vamos por Best Build: portal token-gated (no WordPress).

Flujo: /join (Pollar 1 USDC) → grant Key Unlock en Avalanche → /portal se abre.

Contenido gated: reglamento del gremio, score/reputación, bono ~6% al último. Sin Key = muro. join() del contrato también exige getHasValidKey.

¿Eso cuenta como portal token-gated para el bounty?
```

- [ ] Pregunta enviada
- Respuesta:

---

## Qué no hacer en fase 1

- No gastar el USDC de Pollar (fase 8, **una** vez).
- No crear el lock Unlock todavía (fase 3).
- No retargetear el front a Fuji todavía (fase 2).
- No bridge Stellar ↔ Avalanche.
- No tratar HSK como track de este fin de semana.

Cuando el gate esté en verde, fase 2: `web` de HSK → `avalancheFuji`.
