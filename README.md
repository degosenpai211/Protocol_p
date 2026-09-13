# Riel — pasanaku no-custodio (Avalanche + Unlock + Pollar)

Pitch: *el pasanaku del gremio, con membresía Unlock, reglas en Avalanche y un pago real Pollar. Somos el riel: el dinero no pasa por nosotros.*

No hay bridge Stellar ↔ Avalanche. Tres bounties, tres evidencias:

| Track | Evidencia | README |
|---|---|---|
| Unlock | Lock + `/portal` token-gated | [README-UNLOCK.md](./README-UNLOCK.md) |
| Avalanche | Contrato verificado, ronda en Fuji | [README-AVALANCHE.md](./README-AVALANCHE.md) |
| Pollar | 1 USDC Stellar en `/join` | [README-POLLAR.md](./README-POLLAR.md) |

## Correr local

```bash
cd pasanaku-protocol
npm test
cd web
cp .env.example .env.local
npm install
npm run dev
```

Wallets demo A/B/C y pasos a mano: [tareas-manuales.md](./tareas-manuales.md)  
SDK (túnel viem): [pasanaku-protocol/sdk](./pasanaku-protocol/sdk/README.md)  
Entregas (Telegram / textos): [entregas.md](./entregas.md)  
Guion video ≤3 min: [guion-demo.md](./guion-demo.md)
