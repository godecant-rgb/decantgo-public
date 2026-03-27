"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../src/lib/supabase/client";

type StockRow = {
  id: string;
  perfume: string;
  marca: string | null;
  categoria: string | null;
  genero: string | null;
  ml_total: number | null;
  ml_disponible: number | null;
  costo_ref: number | null;
  costo_por_ml: number | null;
  activo: boolean | null;
  destacado: boolean | null;
};

function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function stockBadge(ml: number | null | undefined) {
  const value = Number(ml ?? 0);
  if (value <= 0) {
    return "border border-rose-500/20 bg-rose-500/10 text-rose-300";
  }
  if (value < 20) {
    return "border border-amber-500/20 bg-amber-500/10 text-amber-300";
  }
  return "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
}

export default function SociosStockPage() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadStock() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("public_products")
        .select(`
          id,
          perfume,
          marca,
          categoria,
          genero,
          ml_total,
          ml_disponible,
          costo_ref,
          costo_por_ml,
          activo,
          destacado
        `)
        .order("perfume", { ascending: true });

      if (error) {
        console.error("STOCK ERROR:", error);
      } else {
        setRows((data ?? []) as StockRow[]);
      }

      setLoading(false);
    }

    loadStock();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) =>
      [r.perfume, r.marca ?? "", r.categoria ?? "", r.genero ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

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
              Stock y costo por ml
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#e2cf9b] md:text-base">
              Controlá rápidamente el stock disponible, el total cargado y el costo de referencia
              de cada perfume del catálogo.
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-[26px] border border-[rgba(223,190,86,0.12)] bg-[rgba(34,27,20,0.82)] p-4 md:p-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar perfume, marca, categoría o género..."
            className="input-premium"
          />
        </section>

        <section className="rounded-[28px] border border-[rgba(223,190,86,0.14)] bg-[rgba(34,27,20,0.82)] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.16)] md:p-5">
          {loading ? (
            <div className="text-sm text-[#e2cf9b]">Cargando stock...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-[#e2cf9b]">No hay perfumes para mostrar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(223,190,86,0.10)] text-left text-[#bfa66a]">
                    <th className="px-3 py-3 font-medium">Perfume</th>
                    <th className="px-3 py-3 font-medium">Marca</th>
                    <th className="px-3 py-3 font-medium">ML total</th>
                    <th className="px-3 py-3 font-medium">ML disponible</th>
                    <th className="px-3 py-3 font-medium">Costo ref</th>
                    <th className="px-3 py-3 font-medium">Costo por ml</th>
                    <th className="px-3 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[rgba(223,190,86,0.08)] text-[#f4e7c3]"
                    >
                      <td className="px-3 py-4">
                        <div className="font-medium">{row.perfume}</div>
                        <div className="mt-1 text-xs text-[#bfa66a]">
                          {row.categoria ?? "Sin categoría"} · {row.genero ?? "Sin género"}
                        </div>
                      </td>
                      <td className="px-3 py-4">{row.marca ?? "—"}</td>
                      <td className="px-3 py-4">{Number(row.ml_total ?? 0).toFixed(0)} ml</td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{Number(row.ml_disponible ?? 0).toFixed(0)} ml</span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] ${stockBadge(
                              row.ml_disponible
                            )}`}
                          >
                            {Number(row.ml_disponible ?? 0) <= 0
                              ? "Sin stock"
                              : Number(row.ml_disponible ?? 0) < 20
                              ? "Bajo stock"
                              : "Disponible"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">{formatMoney(row.costo_ref)}</td>
                      <td className="px-3 py-4">{formatMoney(row.costo_por_ml)}</td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] ${
                              row.activo
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : "border border-white/10 bg-white/5 text-[#f4e7c3]"
                            }`}
                          >
                            {row.activo ? "Activo" : "Inactivo"}
                          </span>

                          {row.destacado ? (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-300">
                              Destacado
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}