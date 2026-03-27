const faqs = [
  {
    q: "¿Qué es un decant?",
    a: "Es una fracción del perfume original en un formato más pequeño, ideal para probarlo o llevarlo contigo.",
  },
  {
    q: "¿Qué tamaños venden?",
    a: "Por el momento trabajamos con decants de 5 ml y 10 ml.",
  },
  {
    q: "¿Cómo hago el pedido?",
    a: "Elegís tus productos, completás tus datos y confirmás el pedido por WhatsApp.",
  },
  {
    q: "¿Hacen envíos?",
    a: "Sí, realizamos envíos a todo el país por agencia DAC y también coordinamos retiros en Sauce, Canelones.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Aceptamos transferencia bancaria, depósitos o Mercado Pago.",
  },
];

export default function FaqPage() {
  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.9)] p-8">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#b9962f]">
            Dudas frecuentes
          </p>
          <h1 className="text-4xl font-bold text-[#d4af37]">FAQ</h1>

          <div className="mt-8 grid gap-4">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-5"
              >
                <h2 className="text-lg font-semibold text-[#d4af37]">
                  {item.q}
                </h2>
                <p className="mt-2 text-sm text-[#d8c68f]">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
