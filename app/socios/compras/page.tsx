"use client";

import { useMemo, useState } from "react";

type FormState = {
  perfume: string;
  marca: string;
  categoria: string;
  genero: string;
  ml_bottle: string;
  quantity_bottles: string;
  unit_cost: string;
  supplier: string;
  notes: string;
  purchased_at: string;
  foto_url: string;
  precio_5ml: string;
  precio_10ml: string;
  activo: boolean;
  destacado: boolean;
};

const initialForm: FormState = {
  perfume: "",
  marca: "",
  categoria: "",
  genero: "",
  ml_bottle: "100",
  quantity_bottles: "1",
  unit_cost: "",
  supplier: "",
  notes: "",
  purchased_at: new Date().toISOString().slice(0, 10),
  foto_url: "",
  precio_5ml: "",
  precio_10ml: "",
  activo: true,
  destacado: false,
};

export default function SociosComprasPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<"success" | "error" | "">("");

  const mlCompra = useMemo(() => {
    const ml = Number(form.ml_bottle || 0);
    const qty = Number(form.quantity_bottles || 0);
    return ml > 0 && qty > 0 ? ml * qty : 0;
  }, [form.ml_bottle, form.quantity_bottles]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResultMessage("");
    setResultType("");

    try {
      const res = await fetch("/api/socios/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ml_bottle: form.ml_bottle,
          quantity_bottles: form.quantity_bottles,
          unit_cost: form.unit_cost,
          precio_5ml: form.precio_5ml,
          precio_10ml: form.precio_10ml,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo guardar la compra.");

      setResultType("success");
      setResultMessage(data?.message || "Compra guardada correctamente.");
      setForm({ ...initialForm, purchased_at: new Date().toISOString().slice(0, 10) });
    } catch (error: any) {
      setResultType("error");
      setResultMessage(error?.message || "Ocurrió un error al guardar la compra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 text-[#f4e7c3] md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <section className="relative mb-8 overflow-hidden rounded-[30px] border border-[rgba(223,190,86,0.18)] bg-[linear-gradient(135deg,#1f1812_0%,#271d12_55%,#18130f_100%)] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,190,86,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(200,146,25,0.10),transparent_26%)]" />
          <div className="relative">
            <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-[#bfa66a]">Socios</p>
            <h1 className="text-3xl font-bold leading-tight text-[#f4e7c3] md:text-5xl">Cargar compra de perfume</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#e2cf9b] md:text-base">Registrá una compra y, si el perfume no existe, se crea en el catálogo. Si ya existe, se actualizan automáticamente los ml disponibles.</p>
          </div>
        </section>

        {resultMessage ? (
          <div className={`mb-6 rounded-2xl px-4 py-3 text-sm ${resultType === "success" ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border border-red-500/20 bg-red-500/10 text-red-300"}`}>{resultMessage}</div>
        ) : null}

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-[rgba(223,190,86,0.14)] bg-[rgba(34,27,20,0.82)] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.16)] md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Perfume *"><input value={form.perfume} onChange={(e) => updateField("perfume", e.target.value)} required className="input-premium" placeholder="Ej: Stronger With You Intensely" /></Field>
            <Field label="Marca"><input value={form.marca} onChange={(e) => updateField("marca", e.target.value)} className="input-premium" placeholder="Ej: Armani" /></Field>
            <Field label="Categoría"><input value={form.categoria} onChange={(e) => updateField("categoria", e.target.value)} className="input-premium" placeholder="Ej: Diseñador / Árabe" /></Field>
            <Field label="Género">
              <select value={form.genero} onChange={(e) => updateField("genero", e.target.value)} className="input-premium">
                <option value="">Seleccionar</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Unisex">Unisex</option>
              </select>
            </Field>
            <Field label="ML por botella *"><input type="number" min="1" step="1" value={form.ml_bottle} onChange={(e) => updateField("ml_bottle", e.target.value)} required className="input-premium" /></Field>
            <Field label="Cantidad de botellas *"><input type="number" min="1" step="1" value={form.quantity_bottles} onChange={(e) => updateField("quantity_bottles", e.target.value)} required className="input-premium" /></Field>
            <Field label="Costo unitario"><input type="number" min="0" step="0.01" value={form.unit_cost} onChange={(e) => updateField("unit_cost", e.target.value)} className="input-premium" placeholder="Ej: 3200" /></Field>
            <Field label="Proveedor"><input value={form.supplier} onChange={(e) => updateField("supplier", e.target.value)} className="input-premium" placeholder="Ej: Importador / Tienda" /></Field>
            <Field label="Precio 5 ml"><input type="number" min="0" step="0.01" value={form.precio_5ml} onChange={(e) => updateField("precio_5ml", e.target.value)} className="input-premium" /></Field>
            <Field label="Precio 10 ml"><input type="number" min="0" step="0.01" value={form.precio_10ml} onChange={(e) => updateField("precio_10ml", e.target.value)} className="input-premium" /></Field>
            <Field label="Foto URL"><input value={form.foto_url} onChange={(e) => updateField("foto_url", e.target.value)} className="input-premium" placeholder="https://..." /></Field>
            <Field label="Fecha de compra"><input type="date" value={form.purchased_at} onChange={(e) => updateField("purchased_at", e.target.value)} className="input-premium" /></Field>
          </div>

          <div className="mt-4">
            <Field label="Notas"><textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={4} className="input-premium resize-none" placeholder="Notas internas sobre la compra" /></Field>
          </div>

          <div className="mt-5 grid gap-3 rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] p-4 md:grid-cols-3">
            <SummaryItem label="ML totales de la compra" value={`${mlCompra} ml`} />
            <SummaryItem label="Activo en catálogo" value={form.activo ? "Sí" : "No"} />
            <SummaryItem label="Destacado" value={form.destacado ? "Sí" : "No"} />
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-[#e2cf9b]"><input type="checkbox" checked={form.activo} onChange={(e) => updateField("activo", e.target.checked)} />Activo</label>
            <label className="inline-flex items-center gap-2 text-sm text-[#e2cf9b]"><input type="checkbox" checked={form.destacado} onChange={(e) => updateField("destacado", e.target.checked)} />Destacado</label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={loading} className="rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-6 py-3 text-sm font-bold text-black shadow-[0_12px_28px_rgba(223,190,86,0.16)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Guardando..." : "Guardar compra"}
            </button>

            <button type="button" onClick={() => setForm({ ...initialForm, purchased_at: new Date().toISOString().slice(0, 10) })} className="rounded-full border border-[rgba(223,190,86,0.16)] px-6 py-3 text-sm text-[#e2cf9b] transition hover:border-[rgba(223,190,86,0.28)] hover:bg-[rgba(223,190,86,0.06)] hover:text-[#fff1c7]">
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode; }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#e2cf9b]">{label}</span>
      {children}
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string; }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-[#b59a5d]">{label}</div>
      <div className="mt-1 text-base font-semibold text-[#f4e7c3]">{value}</div>
    </div>
  );
}
