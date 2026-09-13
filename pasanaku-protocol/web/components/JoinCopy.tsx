export function JoinCopy() {
  return (
    <div className="rise">
      <p className="kicker">Pollar · rampa</p>
      <h1 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-[2.7rem]">Activar gremio</h1>
      <p className="mt-4 font-serif text-[1.55rem] italic leading-snug text-ink/70">
        Stellar deja el recibo. El pozo no cruza.
      </p>
      <p className="mt-5 max-w-md text-[15.5px] leading-7 text-dim">
        En testnet no dependemos del faucet de Circle. Pedís XLM, cerrás 1 XLM (o USDC si hay
        swap). El dólar real es mainnet, una vez. Unlock es otra llave: si ya la tenés, la sala
        abre igual.
      </p>
      <img src="/gremio-pozo.png" alt="Pozo del gremio" className="photo mt-8 h-52 w-full sm:h-64" />
      <ol className="mt-8 space-y-4">
        <li className="grid grid-cols-[2.2rem_1fr] gap-3">
          <span className="font-num text-xl text-num">1</span>
          <div>
            <p className="font-medium">Google o Freighter</p>
            <p className="text-sm leading-6 text-dim">Pollar crea o ata la G. Permití popups.</p>
          </div>
        </li>
        <li className="grid grid-cols-[2.2rem_1fr] gap-3">
          <span className="font-num text-xl text-num">2</span>
          <div>
            <p className="font-medium">XLM de prueba, después el pago</p>
            <p className="text-sm leading-6 text-dim">Friendbot financia. 1 XLM cierra el riel. USDC si hay saldo o swap.</p>
          </div>
        </li>
        <li className="grid grid-cols-[2.2rem_1fr] gap-3">
          <span className="font-num text-xl text-num">3</span>
          <div>
            <p className="font-medium">Hash</p>
            <p className="text-sm leading-6 text-dim">Ese es el recibo Pollar. La Key Unlock es aparte.</p>
          </div>
        </li>
      </ol>
    </div>
  );
}
