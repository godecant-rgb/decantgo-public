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
  return "border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.05)] text-[#f4e7c3]";
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("public_products")
        .select("*")
        .eq("activo", true)
        .order("destacado", { ascending: false })
        .order("orden", { ascending: true });

      if (error) {
        console.error("HOME PRODUCTS ERROR:", error);
      } else {
        setProducts((data ?? []) as Product[]);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  const destacados = useMemo(() => {
    const featured = products.filter((p) => p.destacado);
    return (featured.length > 0 ? featured : products).slice(0, 6);
  }, [products]);

  return (
    <main className="px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[36px] border border-[rgba(223,190,86,0.18)] bg-[linear-gradient(135deg,#1c1711_0%,#241a0f_50%,#17130f_100%)] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:p-12 lg:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,190,86,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(200,146,25,0.10),transparent_28%)]" />

          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.42em] text-[#bfa66a]">
                Selección premium de fragancias
              </p>

              <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] text-[#f4e7c3] md:text-6xl">
                Descubrí perfumes con presencia, carácter y estilo.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-[#e2cf9b] md:text-lg">
                Decants premium de 5 ml y 10 ml para explorar fragancias árabes y de diseñador antes de elegir tu favorita.
                Una experiencia simple, cuidada y pensada para descubrir aromas con identidad.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/catalogo"
                  className="rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-7 py-3.5 text-sm font-bold text-black shadow-[0_10px_25px_rgba(223,190,86,0.18)] transition hover:scale-[1.02]"
                >
                  Explorar catálogo
                </Link>

                <Link
                  href="/como-comprar"
                  className="rounded-full border border-[rgba(223,190,86,0.18)] bg-[rgba(255,248,235,0.05)] px-7 py-3.5 text-sm font-medium text-[#f4e7c3] transition hover:border-[rgba(223,190,86,0.30)] hover:bg-[rgba(255,248,235,0.08)]"
                >
                  Cómo comprar
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["5 ml y 10 ml", "Probá antes de comprar una botella completa"],
                  ["Envíos a todo Uruguay", "DAC y coordinación de retiro"],
                  ["Atención personalizada", "Te ayudamos a elegir mejor"],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.05)] p-4 backdrop-blur-sm"
                  >
                    <div className="text-sm font-semibold text-[#e7c96a]">{title}</div>
                    <div className="mt-1 text-xs leading-5 text-[#e2cf9b]">{text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-[rgba(223,190,86,0.16)] bg-[rgba(255,248,235,0.05)] p-6">
                <p className="text-xs uppercase tracking-[0.32em] text-[#bfa66a]">
                  La experiencia
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[#f4e7c3]">
                  Elegir un perfume también puede sentirse exclusivo.
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#e2cf9b]">
                  No se trata solo de comprar un decant. Se trata de descubrir fragancias con estilo,
                  comparar opciones y encontrar la que mejor encaja con vos.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Selección cuidada", "Perfumes elegidos con identidad, presencia y buena salida."],
                  ["Compra simple", "Explorás, armás tu pedido y lo confirmás por WhatsApp."],
                  ["Presentación premium", "Marca, imagen y experiencia visual pensadas al detalle."],
                  ["Asistente IA activo", "Ahora ya podés pedir recomendaciones personalizadas del catálogo."],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.05)] p-5 transition hover:-translate-y-1 hover:border-[rgba(223,190,86,0.26)]"
                  >
                    <h3 className="text-base font-semibold text-[#e7c96a]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#e2cf9b]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[#bfa66a]">
              La experiencia Decant Go
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#f4e7c3] md:text-4xl">
              Una forma más simple y elegante de descubrir fragancias
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#e2cf9b] md:text-base">
              Pensado para quienes quieren explorar perfumes árabes y de diseñador sin comprar a ciegas una botella completa.
              Elegís con más criterio, comparás estilos y encontrás tu favorita con una experiencia más cuidada.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              [
                "Explorá con más libertad",
                "Descubrí perfumes en formato decant para probar, comparar y elegir con más seguridad.",
              ],
              [
                "Elegí según tu estilo",
                "Encontrá opciones intensas, elegantes, dulces o frescas según lo que estés buscando.",
              ],
              [
                "Comprá de forma simple",
                "Armá tu pedido online y confirmalo rápido por WhatsApp, sin complicaciones.",
              ],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[26px] border border-[rgba(223,190,86,0.14)] bg-[rgba(31,24,18,0.82)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
              >
                <h3 className="text-xl font-semibold text-[#e7c96a]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#e2cf9b]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-[#bfa66a]">
                Selección destacada
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#f4e7c3] md:text-4xl">
                Fragancias para empezar a descubrir
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#e2cf9b]">
                Una selección de perfumes destacados para explorar distintas personalidades, estilos y familias aromáticas.
              </p>
            </div>

            <Link
              href="/catalogo"
              className="text-sm font-medium text-[#e2cf9b] transition hover:text-[#fff1c7]"
            >
              Ver catálogo completo
            </Link>
          </div>

          {loading ? (
            <div className="rounded-[24px] border border-[rgba(223,190,86,0.14)] bg-[rgba(31,24,18,0.82)] p-6 text-sm text-[#e2cf9b]">
              Cargando destacados...
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {destacados.map((p) => (
                <article
                  key={p.id}
                  className="group overflow-hidden rounded-[26px] border border-[rgba(223,190,86,0.18)] bg-[#1c1611] shadow-[0_14px_35px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(223,190,86,0.30)]"
                >
                  <div className="flex h-[280px] items-center justify-center bg-[linear-gradient(180deg,#241d17,#18130f)]">
                    {p.foto_url ? (
                      <img
                        src={p.foto_url}
                        alt={p.perfume}
                        className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="text-sm text-[#bfa66a]">Sin imagen</span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-4 min-h-[110px]">
                      <div className="mb-3">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${badgeClass(
                            p.categoria
                          )}`}
                        >
                          {p.categoria ?? "Sin categoría"}
                        </span>
                      </div>

                      <h3
                        className="line-clamp-2 text-xl font-semibold leading-8 text-[#f4e7c3]"
                        title={p.perfume}
                      >
                        {p.perfume}
                      </h3>

                      <p className="mt-2 text-sm text-[#e2cf9b]">
                        {p.marca ?? "Sin marca"}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm">
                      {p.precio_5ml ? (
                        <div className="rounded-xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-3 py-2.5 text-[#f4e7c3]">
                          5 ml:{" "}
                          <span className="font-semibold text-[#e7c96a]">
                            {formatPrice(p.precio_5ml)}
                          </span>
                        </div>
                      ) : null}

                      {p.precio_10ml ? (
                        <div className="rounded-xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-3 py-2.5 text-[#f4e7c3]">
                          10 ml:{" "}
                          <span className="font-semibold text-[#e7c96a]">
                            {formatPrice(p.precio_10ml)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5">
                      <Link
                        href="/catalogo"
                        className="inline-flex rounded-full border border-[rgba(223,190,86,0.18)] px-4 py-2 text-sm font-medium text-[#e7c96a] transition hover:bg-[rgba(223,190,86,0.08)]"
                      >
                        Ver en catálogo
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-14 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-[rgba(223,190,86,0.16)] bg-[linear-gradient(135deg,#221a14,#1b140f)] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-[#bfa66a]">
              Asesoría inteligente
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#f4e7c3]">
              Recomendaciones más personales
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#e2cf9b] md:text-base">
              Nuestro asistente ya puede analizar el catálogo y ayudarte según ocasión,
              estilo, intensidad y tipo de aroma para recomendarte opciones más alineadas con lo que buscás.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {["Dulce o fresco", "Día o noche", "Árabe o diseñador", "Más intenso o más elegante"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.05)] px-4 py-2 text-xs text-[#f4e7c3]"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="grid gap-5">
            <Link
              href="/catalogo"
              className="rounded-[26px] border border-[rgba(223,190,86,0.14)] bg-[rgba(31,24,18,0.82)] p-6 transition hover:-translate-y-1 hover:border-[rgba(223,190,86,0.25)]"
            >
              <h3 className="text-2xl font-bold text-[#f4e7c3]">Catálogo</h3>
              <p className="mt-2 text-sm leading-6 text-[#e2cf9b]">
                Explorá perfumes, filtrá por marca o categoría y descubrí nuevas opciones.
              </p>
            </Link>

            <Link
              href="/envios"
              className="rounded-[26px] border border-[rgba(223,190,86,0.14)] bg-[rgba(31,24,18,0.82)] p-6 transition hover:-translate-y-1 hover:border-[rgba(223,190,86,0.25)]"
            >
              <h3 className="text-2xl font-bold text-[#f4e7c3]">Envíos</h3>
              <p className="mt-2 text-sm leading-6 text-[#e2cf9b]">
                Enviamos a todo el país por DAC y coordinamos retiros en Sauce.
              </p>
            </Link>

            <Link
              href="/como-comprar"
              className="rounded-[26px] border border-[rgba(223,190,86,0.14)] bg-[rgba(31,24,18,0.82)] p-6 transition hover:-translate-y-1 hover:border-[rgba(223,190,86,0.25)]"
            >
              <h3 className="text-2xl font-bold text-[#f4e7c3]">Cómo comprar</h3>
              <p className="mt-2 text-sm leading-6 text-[#e2cf9b]">
                Armá tu pedido online y confirmalo fácilmente por WhatsApp.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
