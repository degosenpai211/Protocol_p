# Riel — pasanaku no-custodio (Avalanche + Unlock + Pollar)

Repo de entrega: [Protocol_p](https://github.com/degosenpai211/Protocol_p).

Pitch: *el pasanaku del gremio, con membresía Unlock, reglas en Avalanche y un pago real Pollar. Somos el riel: el dinero no pasa por nosotros.*

No hay bridge Stellar ↔ Avalanche. Tres bounties, tres evidencias: Unlock (`/portal` token-gated), Avalanche (contrato en C-Chain) y Pollar (1 USDC en `/join`).

Presentación: [pitch_y_presentacion.md](./pitch_y_presentacion.md)

## Correr local

```bash
cd pasanaku-protocol
npm test
cd web
cp .env.example .env.local
npm install
npm run dev
```
