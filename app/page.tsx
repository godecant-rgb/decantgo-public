"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../src/lib/supabase/client";

type Product = {
  id: string;
  perfume: string;
  marca: string | null;
  categoria: string | null;
  foto_url: string | null;
  precio_5ml: number | null;
  precio_10ml: number | null;
  destacado: boolean | null;
};

function formatPrice(v: number | null | undefined) {
  return `$${Number(v ?? 0).toFixed(0)}`;
}

function badgeClass(cat: string | null) {
  const c = (cat || "").toLowerCase();
  if (c.includes("dise")) return "border-sky-500/20 bg-sky-500/10 text-sky-300";
  if (c.includes("arab")) return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  return "border-white/10 bg-white/5 text-[#f5e7c2]";
}

export default function HomePage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("public_products")
        .select("*")
        .eq("activo", true)
        .order("destacado", { ascending: false })
        .order("orden", { ascending: true });

      if (error) console.error("HOME PRODUCTS ERROR:", error);
      setProducts((data ?? []) as Product[]);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const destacados = useMemo(() => {
    const featured = products.filter((p) => p.destacado);
    return (featured.length > 0 ? featured : products).slice(0, 6);
  }, [products]);

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[32px] border border-[rgba(212,175,55,0.18)] bg-[linear-gradient(135deg,#121212,#1b1205)] p-8 shadow-[0_12px_30px_rgba(0,0,0,0.25)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#b9962f]">Experiencia premium</p>
              <h1 className="text-4xl font-bold leading-tight text-[#d4af37] md:text-6xl">
                Descubrí tu próxima fragancia en formato decant
              </h1>
              <p className="mt-5 max-w-xl text-base text-[#e8d8a6] md:text-lg">
                Elegí perfumes seleccionados en 5 ml y 10 ml, armá tu pedido online y confirmalo por WhatsApp.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalogo" className="rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-6 py-3 font-bold text-black">
                  Ver catálogo
                </Link>
                <Link href="/como-comprar" className="rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.04)] px-6 py-3 font-medium">
                  Cómo comprar
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["5 ml y 10 ml", "Probá antes de comprar botella completa"],
                  ["Envíos DAC", "A todo el país"],
                  ["Retiro", "Con coordinación en Sauce, Canelones"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-4">
                    <div className="text-sm font-semibold text-[#d4af37]">{title}</div>
                    <div className="mt-1 text-xs text-[#d8c68f]">{text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Catálogo", "Perfumes árabes y de diseñador seleccionados."],
                ["Pedido simple", "Armás tu carrito y confirmás por WhatsApp."],
                ["Atención personalizada", "Te ayudamos a elegir según tu gusto."],
                ["Experiencia premium", "Imagen, marca y presentación cuidadas."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[24px] border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h3 className="text-lg font-semibold text-[#d4af37]">{title}</h3>
                  <p className="mt-2 text-sm text-[#d8c68f]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b9962f]">Selección destacada</p>
              <h2 className="mt-2 text-3xl font-bold text-[#d4af37]">Perfumes destacados</h2>
            </div>
            <Link href="/catalogo" className="text-sm text-[#d8c68f] hover:text-[#d4af37]">
              Ver catálogo completo
            </Link>
          </div>

          {loading ? (
            <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(17,17,17,0.86)] p-6 text-sm text-[#d8c68f]">
              Cargando destacados...
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {destacados.map((p) => (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-[24px] border border-[rgba(212,175,55,0.18)] bg-[#111] shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.3)]"
                >
                  <div className="flex h-[250px] items-center justify-center bg-[linear-gradient(180deg,#1a1a1a,#111)]">
                    {p.foto_url ? (
                      <img src={p.foto_url} alt={p.perfume} className="h-full w-full object-contain p-3" />
                    ) : (
                      <span className="text-sm text-[#9d8c5c]">Sin imagen</span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-3 min-h-[92px]">
                      <h3 className="line-clamp-2 min-h-[56px] text-lg font-semibold leading-7 text-[#d4af37]" title={p.perfume}>
                        {p.perfume}
                      </h3>
                      <p className="mt-1 text-sm text-[#d8c68f]">{p.marca ?? "Sin marca"}</p>
                      <div className="mt-2">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(p.categoria)}`}>
                          {p.categoria ?? "Sin categoría"}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm">
                      {p.precio_5ml ? (
                        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[#f5e7c2]">
                          5 ml: <span className="font-semibold text-[#d4af37]">{formatPrice(p.precio_5ml)}</span>
                        </div>
                      ) : null}

                      {p.precio_10ml ? (
                        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[#f5e7c2]">
                          10 ml: <span className="font-semibold text-[#d4af37]">{formatPrice(p.precio_10ml)}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <Link href="/catalogo" className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(17,17,17,0.86)] p-6 transition hover:-translate-y-1">
            <h2 className="text-2xl font-bold text-[#d4af37]">Catálogo</h2>
            <p className="mt-2 text-sm text-[#d8c68f]">Explorá perfumes, filtrá por marca o categoría y armá tu pedido.</p>
          </Link>
          <Link href="/envios" className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(17,17,17,0.86)] p-6 transition hover:-translate-y-1">
            <h2 className="text-2xl font-bold text-[#d4af37]">Envíos</h2>
            <p className="mt-2 text-sm text-[#d8c68f]">Enviamos a todo el país por DAC y coordinamos retiros en Sauce.</p>
          </Link>
          <Link href="/como-comprar" className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(17,17,17,0.86)] p-6 transition hover:-translate-y-1">
            <h2 className="text-2xl font-bold text-[#d4af37]">Cómo comprar</h2>
            <p className="mt-2 text-sm text-[#d8c68f]">Conocé el proceso paso a paso para hacer tu pedido.</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
