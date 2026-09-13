# @pasanaku/sdk

Túnel JS (viem) sobre `PasanakuProtocol`. La UI de `web/` es la demo; cualquier wallet o app puede llamar esto.

```ts
import { createPasanaku } from "./src";

const riel = createPasanaku({ publicClient, walletClient, protocol });
await riel.createCircle(members, contribution, collateral, 1); // 1 = crédito
await riel.join(0n);
await riel.contribute(0n);
await riel.claim(0n);
await riel.markDefault(0n, defaulter);
await riel.withdraw();
const state = await riel.getState(0n);
```

La UI de `/app` usa este túnel (`useRiel`). Mint/approve del mock token siguen en la wallet.

Sin Key Unlock, `join()` revierte `no membership`. El SDK no toca el pozo: firma la wallet.
