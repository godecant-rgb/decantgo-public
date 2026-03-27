"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
  usage_limit: number | null;
  used_count: number | null;
  expires_at: string | null;
  first_purchase_only: boolean | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
};

type FormState = {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: string;
  active: boolean;
  usage_limit: string;
  expires_at: string;
  first_purchase_only: boolean;
  assigned_to: string;
  notes: string;
};

const initialForm: FormState = {
  code: "",
  discount_type: "percent",
  discount_value: "",
  active: true,
  usage_limit: "",
  expires_at: "",
  first_purchase_only: false,
  assigned_to: "",
  notes: "",
};

export default function SociosCuponesPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<"success" | "error" | "">("");

  async function loadCoupons() {
    setLoadingCoupons(true);
    try {
      const res = await fetch("/api/socios/cupones");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudieron cargar los cupones.");
      setCoupons(data.coupons ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCoupons(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResultMessage("");
    setResultType("");

    try {
      const res = await fetch("/api/socios/cupones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo crear el cupón.");
      }

      setResultType("success");
      setResultMessage(data?.message || "Cupón creado correctamente.");
      setForm(initialForm);
      await loadCoupons();
    } catch (error: any) {
      setResultType("error");
      setResultMessage(error?.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 text-[#f4e7c3] md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-8 overflow-hidden rounded-[30px] border border-[rgba(223,190,86,0.18)] bg-[linear-gradient(135deg,#1f1812_0%,#271d12_55%,#18130f_100%)] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,190,86,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(200,146,25,0.10),transparent_26%)]" />
          <div className="relative">
            <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-[#bfa66a]">
              Socios
            </p>
            <h1 className="text-3xl font-bold leading-tight text-[#f4e7c3] md:text-5xl">
              Cupones
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#e2cf9b] md:text-base">
              Creá cupones para promociones, primera compra, clientes específicos o campañas.
            </p>
          </div>
        </section>

        {resultMessage ? (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
              resultType === "success"
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            {resultMessage}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-[rgba(223,190,86,0.14)] bg-[rgba(34,27,20,0.82)] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.16)] md:p-6"
          >
            <h2 className="text-2xl font-bold text-[#f4e7c3]">Crear cupón</h2>

            <div className="mt-5 grid gap-4">
              <Field label="Código *">
                <input
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                  required
                  className="input-premium"
                  placeholder="Ej: PRIMERA10"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tipo de descuento *">
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      updateField("discount_type", e.target.value as "percent" | "fixed")
                    }
                    className="input-premium"
                  >
                    <option value="percent">Porcentaje</option>
                    <option value="fixed">Monto fijo</option>
                  </select>
                </Field>

                <Field label="Valor *">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount_value}
                    onChange={(e) => updateField("discount_value", e.target.value)}
                    required
                    className="input-premium"
                    placeholder={form.discount_type === "percent" ? "10" : "200"}
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Límite de uso">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.usage_limit}
                    onChange={(e) => updateField("usage_limit", e.target.value)}
                    className="input-premium"
                    placeholder="Ej: 1"
                  />
                </Field>

                <Field label="Vencimiento">
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => updateField("expires_at", e.target.value)}
                    className="input-premium"
                  />
                </Field>
              </div>

              <Field label="Asignado a">
                <input
                  value={form.assigned_to}
                  onChange={(e) => updateField("assigned_to", e.target.value)}
                  className="input-premium"
                  placeholder="Ej: @cliente, teléfono o nombre"
                />
              </Field>

              <Field label="Notas">
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={4}
                  className="input-premium resize-none"
                  placeholder="Notas internas"
                />
              </Field>

              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-[#e2cf9b]">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => updateField("active", e.target.checked)}
                  />
                  Activo
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-[#e2cf9b]">
                  <input
                    type="checkbox"
                    checked={form.first_purchase_only}
                    onChange={(e) => updateField("first_purchase_only", e.target.checked)}
                  />
                  Solo primera compra
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-6 py-3 text-sm font-bold text-black shadow-[0_12px_28px_rgba(223,190,86,0.16)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Crear cupón"}
              </button>
            </div>
          </form>

          <section className="rounded-[28px] border border-[rgba(223,190,86,0.14)] bg-[rgba(34,27,20,0.82)] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.16)] md:p-6">
            <h2 className="text-2xl font-bold text-[#f4e7c3]">Cupones creados</h2>

            <div className="mt-5 grid gap-3">
              {loadingCoupons ? (
                <div className="text-sm text-[#e2cf9b]">Cargando cupones...</div>
              ) : coupons.length === 0 ? (
                <div className="text-sm text-[#e2cf9b]">Todavía no hay cupones.</div>
              ) : (
                coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-lg font-semibold text-[#f4e7c3]">
                          {coupon.code}
                        </div>
                        <div className="mt-1 text-sm text-[#e2cf9b]">
                          {coupon.discount_type === "percent"
                            ? `${coupon.discount_value}% de descuento`
                            : `$${coupon.discount_value} de descuento`}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] ${
                              coupon.active
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : "border border-white/10 bg-white/5 text-[#f4e7c3]"
                            }`}
                          >
                            {coupon.active ? "Activo" : "Inactivo"}
                          </span>

                          {coupon.first_purchase_only ? (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-300">
                              Primera compra
                            </span>
                          ) : null}

                          {coupon.usage_limit ? (
                            <span className="rounded-full border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-2.5 py-1 text-[11px] text-[#e2cf9b]">
                              Límite: {coupon.usage_limit}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right text-xs text-[#bfa66a]">
                        <div>Usado: {coupon.used_count ?? 0}</div>
                        <div className="mt-1">
                          {coupon.expires_at ? `Vence: ${coupon.expires_at}` : "Sin vencimiento"}
                        </div>
                      </div>
                    </div>

                    {coupon.assigned_to ? (
                      <div className="mt-3 text-sm text-[#e2cf9b]">
                        Asignado a: {coupon.assigned_to}
                      </div>
                    ) : null}

                    {coupon.notes ? (
                      <div className="mt-2 text-sm text-[#bfa66a]">{coupon.notes}</div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#e2cf9b]">{label}</span>
      {children}
    </label>
  );
}