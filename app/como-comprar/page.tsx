export default function ComoComprarPage() {
  const steps = [
    "Elegí los decants que más te gusten del catálogo.",
    "Agregá productos de 5 ml o 10 ml al carrito.",
    "Completá tus datos de contacto y envío.",
    "Confirmá el pedido por WhatsApp.",
    "Coordinamos pago, preparación y entrega.",
  ];

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.9)] p-8">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#b9962f]">Guía rápida</p>
          <h1 className="text-4xl font-bold text-[#d4af37]">Cómo comprar</h1>
          <p className="mt-3 max-w-2xl text-[#d8c68f]">Queremos que tu experiencia sea simple, clara y rápida.</p>
          <div className="mt-8 grid gap-4">
            {steps.map((step, i) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] font-bold text-black">{i + 1}</div>
                <div className="pt-2 text-[#f5e7c2]">{step}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
