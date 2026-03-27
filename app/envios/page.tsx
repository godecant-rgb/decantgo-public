export default function EnviosPage() {
  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.9)] p-8">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#b9962f]">
            Información útil
          </p>
          <h1 className="text-4xl font-bold text-[#d4af37]">Envíos</h1>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-5">
              <h2 className="text-xl font-semibold text-[#d4af37]">
                Envíos a todo el país
              </h2>
              <p className="mt-2 text-sm text-[#d8c68f]">
                Realizamos envíos a todo Uruguay por agencia DAC.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-5">
              <h2 className="text-xl font-semibold text-[#d4af37]">
                Retiros
              </h2>
              <p className="mt-2 text-sm text-[#d8c68f]">
                Los retiros se realizan únicamente con previa coordinación en
                Sauce, Canelones.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-5">
              <h2 className="text-xl font-semibold text-[#d4af37]">
                Seguimiento
              </h2>
              <p className="mt-2 text-sm text-[#d8c68f]">
                Una vez confirmado tu pedido, coordinamos el envío o retiro por
                WhatsApp.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-5">
              <h2 className="text-xl font-semibold text-[#d4af37]">
                Observaciones
              </h2>
              <p className="mt-2 text-sm text-[#d8c68f]">
                Podés dejar referencia de dirección y notas al momento de hacer
                tu pedido.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
