# /plan Riel — Avalanche + Unlock + Pollar (versión actualizada)

> **Este es el plan vigente del fin de semana local.**
> `plan-pasanaku.md` es el /plan original de estos 3 tracks, pero se quedó viejo (escrow 20%, sin ROSCASH, sin riel/SDK, sin bono del último).
> `plan-eag-hsk.md` tiene las revisiones de producto, **mal etiquetadas para HSK**. HSK **no es para ahora**. Todo eso aplica **aquí**.
> Tracks: **Unlock** (membresía / portal) + **Avalanche** (contrato verificado) + **Pollar** (1 pago real).
> Presupuesto: **$5**. Pollar y Avalanche cierran **13 sep**. Unlock llega hasta **18 sep**.
> Código ya empezado: `pasanaku-protocol/` (contratos + tests + `web/`). Hay que **apuntarlo a Avalanche** y **enchufar Unlock + Pollar**.

---

## 0. Resumen ejecutivo

- **Qué construyes:** un **riel no-custodio de pasanaku** (ROSCA) en **Avalanche**, con **membresía Unlock** que abre el portal y **Pollar** como rampa/activación real (Stellar, 1 USDC).
- **No es una app que junta plata.** Es protocolo + SDK (túnel) + UI de referencia. La Key de Unlock es la **puerta del túnel**, no el pozo.
- **Diferenciador:** no la mecánica ROSCA (eso ya existe). Mercado **gremio / diáspora sudamericana** + rampa local Pollar + membresía on-chain + contrato verificado.
- **Modelo de dinero:** colateral **chico (2–3 cuotas) reembolsable** + **fondo de seguro** + **reputación** + **bono ~6% al último** (lo pagan los que cobran antes). Nunca colateral = deuda completa.
- **Dos modos:** **Ahorro** (demo anti-estafa) y **Crédito** (pasanaku real).
- **Pollar ≠ Avalanche ≠ Unlock.** Tres ecosistemas. **No hay bridge.** Cada uno cumple el requisito de *su* bounty.

Pitch de una línea: *“El pasanaku del gremio, con membresía Unlock, reglas en Avalanche y un pago real Pollar. Somos el riel: el dinero no pasa por nosotros.”*

---

## 1. Cómo cada track gana su bounty (requisitos → qué muestras)

El mismo proyecto se entrega **tres veces**, cada uno con evidencia independiente.

### 1.1 Unlock — $800 (el más pagado) · cierra **18 sep 23:59 BO**

Vas por **Best Build: portal token-gated** ($250 / $150), no por el plugin WordPress.

Unlock **no es una chain**. Es locks + keys (ERC-721) **en Avalanche**.

| Criterio Unlock | Peso | Cómo lo cubres |
|---|---|---|
| Integración con Unlock | 30% | Lock en Fuji/C-Chain. `getHasValidKey` abre `/portal` **y** `join()` del contrato. README con address del lock. |
| UX y flujo de acceso | 25% | `/join` → Pollar 1 USDC → grant Key → `/portal` se desbloquea. Video: bloqueado → Key → se ve. |
| Potencial y creatividad | 25% | Membresía de **gremio / círculo**, no un blog random. Reglamento + reputación + bono del último = contenido que **solo el miembro** ve. |
| Ejecución técnica | 20% | Gate en cliente + chequeo on-chain. Sin Key no hay contribute. |

**Entrega Unlock:** nombre, equipo, repo, README **solo de Unlock**, URL, video ≤3 min, **address del lock**, contacto.

**Está bien si:** una wallet sin Key ve el muro; con Key ve reglamento, score, bono de espera y el círculo.

### 1.2 Avalanche — $200 · cierra **13 sep**

| Criterio Avalanche | Peso | Cómo lo cubres |
|---|---|---|
| Integración relevante | 40% | El **pozo, turnos, colateral, seguro, claim, recover** viven en Avalanche. No es un stamp. |
| Caso de uso | 25% | Pasanaku de gremio / diáspora. Por qué C-Chain: EVM, Unlock ya está, gas bajo, verificación Snowtrace. |
| Implementación | 25% | `PasanakuProtocol.sol` **desplegado y verificado**. Tests en verde. |
| Potencial | 10% | SDK + modos Ahorro/Crédito + bono del último. Roadmap subasta ROSCASH. |

**Requisito duro:** *“Agregar Avalanche solo para cumplir no alcanza.”* El contrato **es** el producto.

**Fuji vs mainnet:** ciclo demo en **Fuji (43113)** con MockUSDC gratis. Si el mentor exige C-Chain: deploy verificado en **43114** (gas de tus $5). Pregunta **hoy**.

### 1.3 Pollar — $200 (120 / 80 USDC) · cierra **13 sep**

Pollar es **Stellar**. El USDC de Pollar **no entra** al contrato de Avalanche.

| Criterio Pollar | Peso | Cómo lo cubres |
|---|---|---|
| Impacto | 30% | Activar el gremio / rampa del pasanaku cotidiano (el bounty **lista pasanakus** como idea). |
| Potencial | 25% | Rampa fiat→activación; el riel EVM sigue después. |
| Integración Pollar | 25% | Flujo **dentro de `/join`**, no un link suelto. |
| Tx reales mainnet | 20% | **1 USDC** mainnet. Hash en la app + README + Telegram. |

**Requisitos:** formulario mainnet **día 1** · `@pollar/react` en un flujo · 1 tx · repo · URL · demo ≤3 min.

**Está bien si:** el juez ve el hash Stellar y entiende “Pollar activa; Avalanche gobierna el círculo”.

---

## 2. Arquitectura (no la rompas)

```
  Fiat Bs/ARS ──► Pollar (Stellar mainnet, 1 USDC)     ← bounty Pollar
                      │  hash de activación
                      ▼
              Unlock Key (ERC-721 en Avalanche)         ← bounty Unlock
                      │  getHasValidKey == true
                      ▼
         /portal  +  @pasanaku/sdk  +  PasanakuProtocol  ← bounty Avalanche
                      │  join / contribute / claim / withdraw
                      ▼
              MockUSDC (Fuji) o USDC (si hay mainnet)
```

| Capa | Dónde | Qué demuestra |
|---|---|---|
| Pollar | Stellar mainnet | Pago real. Rampa / activación del gremio. |
| Unlock Lock | Avalanche | Membresía. Abre `/portal` y `join()`. |
| `PasanakuProtocol.sol` | Avalanche, **verificado** | Turnos, colateral, seguro, bono 6%, recover. |
| `@pasanaku/sdk` | JS/viem | Túnel para cualquier wallet. La UI es referencia. |

Con $5 el pozo grande **no** es USDC mainnet. Demo del círculo = **MockUSDC en Fuji**. El dinero “de verdad” que pide Pollar es **una** tx de 1 USDC.

---

## 3. Riel / SDK / membresía (lo que faltaba en `plan-pasanaku.md`)

```
  Apps (esta UI, una wallet, Vaquita-like)     ← capa superficial
           │  usan el SDK
           ▼
  Unlock Key  =  puerta (¿puedes entrar?)
           │
  Entidad (matching, grantKeys, soporte, rampa Pollar)  ← central, NO toca el pozo
           │
           ▼
  PasanakuProtocol.sol en Avalanche            ← riel: custodia y reglas
```

**Unlock entra al plan membresía, no al pozo.** La Key dice *quién puede usar el riel*. El contrato dice *adónde va la plata*.

SDK mínimo (5 funciones): `createCircle` · `join` · `contribute` · `claim` · `withdraw` + `getState`.

Pitch: *“Cualquier app de gremio o wallet enchufa pasanaku. Esta pantalla es el túnel de prueba.”*

Si el SDK npm no llega a tiempo: la app llama al contrato y el README dice que el SDK es el riel.

---

## 4. Qué decentralizas y qué controlas

| Pieza | On-chain / abierto | Entidad | Por qué |
|---|---|---|---|
| Custodia del pozo | **Contrato Avalanche** | Nunca | Si puedes `withdrawAll`, eres el vetado de 2025. |
| Turnos, claim, recover, bono 6% | Contrato | No | Reglas públicas. |
| Fee 1% + fondo seguro | Contrato | `feeRecipient` = tu wallet | Cobras sin custodiar. |
| Colateral + score | Contrato | No | Anti-default verificable. |
| **¿Quién entra?** | Contrato chequea Unlock | **Grant Keys** lo hace la entidad / dashboard | Membresía controlada; pozo no. |
| Pollar / rampa | Off-chain Stellar | **SÍ** | Distinta chain. |
| Matching, soporte | Off-chain | **SÍ** | Negocio. |
| KYC | No en MVP | Solo Crédito grande, roadmap | KYC a todos espanta al gremio. |

ROSCASH **custodia** hoy y **no tiene** contrato. Tu ventaja frente a ellos: **no-custodio en Avalanche** + Unlock como puerta.

---

## 5. Modelo económico (revisiones que estaban en el doc HSK)

### 5.1 Descartado
Colateral = toda la deuda futura. Al primero le quita liquidez. **No.**

### 5.2 Vigente
- Colateral **2–3 cuotas**, se devuelve al terminar limpio.
- **Fondo de seguro** (0.30% del pozo) cubre huecos.
- **Score:** turnos tempranos para quien ya cumplió.
- **Bono del último ~6% de un pozo:** cada cobro temprano deja un recorte; quien cierra (p. ej. semana 30) se lo lleva. **No es Aave:** en crédito el pozo se va cada ronda.
- Subasta tipo ROSCASH = **roadmap**, no MVP.

### 5.3 Modos
| Modo | Riesgo | Demo |
|---|---|---|
| **Ahorro** | Cero pérdida de pozo adelantado | Enséñalo primero (anti-estafa) |
| **Crédito** | Administrado (colateral + seguro + score) | Pitch: gremio con confianza |

### 5.4 Primero / medio / último
- Primero: liquidez (préstamo del grupo); **paga** el recorte del bono.
- Medio: cobra a mitad; ni el premio ni el recorte grande.
- Último: esperó N semanas; pozo + **~6%**.

No prometas “todos ganan”. Es timing + compensación al que espera.

### 5.5 “No perder dinero”
No existe cero riesgo en Crédito (el pasanaku tradicional tampoco). Lo que **sí** aseguras:
- Modo **Ahorro** para quien no quiere riesgo de fuga.
- Colateral reembolsable + seguro + `recover()` si se congela (máx. ~1 cuota).
- Sin custodia tuya.
- Unlock: solo miembros del gremio (no extraños de internet como ROSCASH).

---

## 6. ROSCASH: copiar, no clonar

Fuente: [roscash.org](https://roscash.org) · stats públicas. App Solana, **ellos custodian**, sin KYC al inicio, subasta 70/30, prepaid del ciclo.

| Tomar | No tomar |
|---|---|
| Subasta como **roadmap** (precio de ir primero) | Custodiar el pozo |
| Rating + depósito que baja | 10% del pozo |
| Honestidad: suma-cero menos fee | “Todos ganan” |
| Formatos múltiples | Ser la app global |

Ellos son **producto**. Tú eres **riel EVM + Unlock + Pollar local**.

Otros: Vaquita (UX, no copies el ahorro individual — es sponsor) · SoroSusu (fondo de seguro) · Moigye (reputación) · GoodGhosting (modo Ahorro).

---

## 7. Q&A demo

| Pregunta | Respuesta |
|---|---|
| ¿Por qué Avalanche? | Ahí viven las reglas y Unlock. Verificado. |
| ¿Por qué Unlock? | La Key es la membresía del gremio; abre el portal y el `join`. |
| ¿Por qué Pollar? | El pago real (Stellar). No puenteamos; activamos. |
| ¿Se fuga el organizer? | No hay `withdrawAll`. Código verificado. |
| ¿El que cobró no paga? | Colateral chico + seguro + score. |
| ¿Colateral = toda mi deuda? | No, 2–3 cuotas. |
| ¿La plata queda trabada? | `claim` → `withdraw`. Si se congela: `recover()`. |
| ¿El último pierde por esperar? | Recibe el bono ~6% que dejaron los primeros. |
| ¿No es estafa? | No-custodio, modo Ahorro, open-source, Unlock de miembros conocidos. |

---

## 8. Código que ya existe (no empieces de cero)

```
pasanaku-protocol/
  contracts/PasanakuProtocol.sol   ← colateral, seguro, modos, bono 6%, recover
  contracts/MockUSDC.sol
  test/PasanakuProtocol.ts         ← 13 tests passing
  web/                             ← UI Riel (hoy apunta HSK; hay que cambiar a Fuji)
```

**Cambios para este plan:**
1. `hardhat.config.ts`: redes `fuji` (43113) y `avalanche` (43114), no HSK.
2. `join()` exige `lock.getHasValidKey(msg.sender)` + test “no membership”.
3. `web/lib/chain.ts`: `avalancheFuji` en vez de HSK.
4. Páginas `/join` (Pollar + Unlock) y `/portal` (UnlockGate).
5. `UnlockMock.sol` para tests.

---

## 9. Stack y env

```
pasanaku-protocol/          (ya está)
  web/app/
    page.tsx                landing Riel
    join/page.tsx           Pollar + Unlock
    portal/page.tsx         SOLO con Key
    app/page.tsx            estudio del círculo (ya existe)
  contracts/
  test/
```

```bash
# ya hay hardhat en la raíz y next en web/
# falta:
npm i @unlock-protocol/networks   # en web/
npm i @pollar/react @pollar/core  # en web/
```

| | Chain ID | Explorer | Faucet |
|---|---|---|---|
| Fuji | **43113** | https://testnet.snowtrace.io | https://build.avax.network/console/primary-network/faucet |
| C-Chain | 43114 | https://snowtrace.io | tus $5 |

Unlock dashboard: https://app.unlock-protocol.com  
Factory Avalanche: `0x70cBE5F72dD85aA634d07d2227a421144Af734b3`  
Pollar: https://docs.pollar.xyz · Telegram bounty: https://t.me/+gNDhgPjIqwY2Yjgx

`.env.local` (web):

```
NEXT_PUBLIC_UNLOCK_LOCK=
NEXT_PUBLIC_PROTOCOL_ADDRESS=
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_POLLAR_API_KEY=
NEXT_PUBLIC_POLLAR_DESTINO=
NEXT_PUBLIC_CHAIN_ID=43113
```

Hardhat: `PRIVATE_KEY=` (AVAX Fuji) · `SNOWTRACE_API_KEY=`

**Prohibido en el MVP:** bridge Stellar↔Avalanche, Aave, plugin WordPress, clonar Vaquita, KYC para todos, HSK.

---

## 10. Fases (con “está bien si…”)

Tres wallets MetaMask **A / B / C** en **Fuji**. A tiene AVAX del faucet y reparte.

### Fase 1 — Trámites
- Formulario Pollar mainnet.
- API key Pollar.
- Faucet Fuji.
- Preguntar mentor Avalanche: ¿Fuji vale o exige C-Chain verificado?
- Unlock: confirmar que `/portal` (reglamento + score + bono) cuenta como token-gated.

**Sigue si:** A,B,C con AVAX; form Pollar enviado.

### Fase 2 — Front a Fuji
Cambiar `web` de HSK → `avalancheFuji`. Conectar A.  
**Sigue si:** la UI pide Fuji y muestra tu address.

### Fase 3 — Lock Unlock (Fuji, $0)
Dashboard: lock “Membresía Gremio Riel”, precio **0** (cobra Pollar), 30 días, grant Keys a A,B,C.  
**Sigue si:** `getHasValidKey(A/B/C) === true` y un extraño `false`.

### Fase 4 — `/portal` gated
Sin Key = muro. Con Key = reglamento, reputación, cómo funciona el 6%.  
**Sigue si:** video 10s bloqueado → conectas A → se abre. **Esto es Unlock.**

### Fase 5 — Contrato + Unlock + tests
`join` requiere Key. UnlockMock en tests. `npx hardhat test` en verde (los 13 + “no membership”).  
**GATE:** tests passing. Sin eso no hay deploy.

### Fase 6 — Deploy Fuji + verificar Snowtrace
MockUSDC + PasanakuProtocol(token, fee, **lock**).  
**Sigue si:** verificado, `contribute` de B se ve en el explorer.

### Fase 7 — Estudio del círculo on-chain
Ritual ronda 0 en la UI (B y C aportan, A cobra, se ve el bono acumular).  
**GATE Avalanche:** 1 ronda real en Fuji desde la UI.

### Fase 8 — Pollar (sandbox, luego **$1** mainnet una vez)
`/join`: “Activar gremio — 1 USDC”. Hash grande en UI + README. Grant Key a mano si hace falta.  
**GATE Pollar:** hash mainnet copiado. No repitas la tx.

### Fase 9 — Entregas
| Bounty | Qué mandar | Cuándo |
|---|---|---|
| Pollar | Telegram: repo, URL, video, **hash**, Vaquita | 13 sep |
| Avalanche | Repo, contrato **verificado**, por qué Avalanche | 13 sep |
| Unlock | Repo, README Unlock, URL `/portal`, video gate, **lock address** | **hasta 18 sep** |

---

## 11. Flujo de usuario (demo)

```
1. /join → paga 1 USDC Pollar (hash) → reciben Key Unlock
2. /portal se abre (token-gated)
3. Mintear MockUSDC (Fuji) + aprobar + join (colateral)
4. contribute() si no te toca
5. claim() cuando todos pagaron → recorte al bono del último
6. withdraw() a la wallet
7. Quien cierra: pozo + ~6% + colateral devuelto + score+1
```

---

## 12. Guion 3 min

1. Problema: pasanaku se cae por fuga; las apps que juntan plata parecen estafa.
2. Tres rieles, sin puente: **Pollar paga**, **Unlock es la llave**, **Avalanche es la ley**.
3. Demo: muro del portal → Key → ronda en Fuji → bono del último subiendo → contrato verificado sin `withdrawAll`.
4. Cierre: riel para gremios/diáspora; ROSCASH es app+custodia, nosotros no.

---

## 13. Checklist anti-estafa

- [ ] Sin `withdrawAll(onlyOwner)` sobre el pozo
- [ ] ReentrancyGuard + pull-payment + `recover()`
- [ ] Cero promesa de rendimiento tipo Aave en modo Crédito
- [ ] Prior art citado (ROSCASH, SoroSusu, Vaquita)
- [ ] Unlock no es adorno: sin Key no hay portal ni `join`

---

## 14. Qué no hacer

- ❌ Tratar HSK como track de este fin de semana
- ❌ Bridge Pollar ↔ Avalanche
- ❌ Vender ROSCA+colateral como novedad
- ❌ Clonar Vaquita
- ❌ Plugin WordPress (otro bounty, otra semana)
- ❌ Gastar los $5 en 10 txs Pollar

---

## 15. Relación con los otros `.md`

| Archivo | Qué es ahora |
|---|---|
| **`plan-avalanche-unlock-pollar.md`** | **Plan vigente** 3 bounties locales + revisiones de producto |
| `plan-pasanaku.md` | Borrador viejo (escrow 20%, sin bono 6%, sin riel). Conservar como historia |
| `plan-eag-hsk.md` | EAG/HSK **después**. El producto está en este archivo, la chain era la confusión |
| `pasanaku-protocol/` | Código: retarget Avalanche + Unlock + Pollar |

---

## 16. Una línea

**Riel de pasanaku en Avalanche** (no-custodio, colateral chico, seguro, bono 6% al último), **puerta Unlock** (portal token-gated) y **1 pago Pollar** (Stellar). SDK = túnel. App = referencia. Postula a los tres bounties locales, cada uno con su evidencia.
