"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../src/lib/supabase/client";
import { addItemToCart, getCartCount } from "../../src/lib/cart";

type Product = {
  id: string;
  perfume: string;
  marca: string | null;
  categoria: string | null;
  genero: string | null;
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

function genderBadgeClass(gender: string | null) {
  const g = (gender || "").toLowerCase();
  if (g === "hombre") return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  if (g === "mujer") return "border-pink-500/20 bg-pink-500/10 text-pink-300";
  if (g === "unisex") return "border-violet-500/20 bg-violet-500/10 text-violet-300";
  return "border-white/10 bg-white/5 text-[#f5e7c2]";
}

export default function CatalogoPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMarca, setSelectedMarca] = useState("todas");
  const [selectedCategoria, setSelectedCategoria] = useState("todas");
  const [selectedGenero, setSelectedGenero] = useState("todos");
  const [addedMessage, setAddedMessage] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("public_products")
        .select("*")
        .eq("activo", true)
        .order("destacado", { ascending: false })
        .order("orden", { ascending: true })
        .order("perfume", { ascending: true });

      if (error) {
        console.error("LOAD PRODUCTS ERROR:", error);
      } else {
        setProducts((data ?? []) as Product[]);
      }

      setLoading(false);
    }

    loadProducts();
    setCartCount(getCartCount());
  }, [supabase]);

  const marcas = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => (p.marca || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const categorias = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => (p.categoria || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const generos = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => (p.genero || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesSearch =
        !q ||
        [p.perfume, p.marca ?? "", p.categoria ?? "", p.genero ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesMarca =
        selectedMarca === "todas" || (p.marca ?? "") === selectedMarca;

      const matchesCategoria =
        selectedCategoria === "todas" || (p.categoria ?? "") === selectedCategoria;

      const matchesGenero =
        selectedGenero === "todos" || (p.genero ?? "") === selectedGenero;

      return matchesSearch && matchesMarca && matchesCategoria && matchesGenero;
    });
  }, [products, search, selectedMarca, selectedCategoria, selectedGenero]);

  function getPrice(product: Product, presentacion: "5ml" | "10ml") {
    if (presentacion === "5ml") return Number(product.precio_5ml ?? 0);
    return Number(product.precio_10ml ?? 0);
  }

  function addToCart(product: Product, presentacion: "5ml" | "10ml") {
    const precio = getPrice(product, presentacion);
    if (!precio || precio <= 0) return;

    addItemToCart({
      product: {
        id: product.id,
        perfume: product.perfume,
        marca: product.marca,
        categoria: product.categoria,
        genero: product.genero,
        foto_url: product.foto_url,
        precio_5ml: product.precio_5ml,
        precio_10ml: product.precio_10ml,
      },
      presentacion,
      cantidad: 1,
      precio,
    });

    setCartCount(getCartCount());
    setAddedMessage(`${product.perfume} ${presentacion} agregado al carrito`);

    setTimeout(() => {
      setAddedMessage("");
    }, 1800);
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 text-[#f5e7c2] md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-[28px] border border-[rgba(212,175,55,0.20)] bg-[linear-gradient(135deg,#121212,#1b1205)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#b9962f]">
                Decant Go
              </p>
              <h1 className="text-3xl font-bold text-[#d4af37] md:text-5xl">
                Catálogo premium
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#e8d8a6] md:text-base">
                Explorá perfumes árabes y de diseñador en presentación de 5 ml y 10 ml.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-300">
                Envíos por DAC
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-[#f5e7c2]">
                Retiro en Sauce, Canelones
              </span>
            </div>
          </div>
        </section>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/carrito"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-3 text-sm font-bold text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
          >
            🛒 Ver carrito
            <span className="rounded-full bg-black/20 px-2 py-1 text-xs text-white">
              {cartCount}
            </span>
          </Link>

          {addedMessage ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {addedMessage}
            </div>
          ) : null}
        </div>

        <section>
          <div className="mb-5 rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(18,18,18,0.88)] p-4">
            <div className="grid gap-3 xl:grid-cols-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar perfume, marca o categoría..."
                className="w-full rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none transition placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
              />

              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
              >
                <option value="todas">Todas las marcas</option>
                {marcas.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedGenero}
                onChange={(e) => setSelectedGenero(e.target.value)}
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
              >
                <option value="todos">Todos los géneros</option>
                {generos.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(17,17,17,0.86)] p-6">
              Cargando catálogo...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(17,17,17,0.86)] p-6">
              No hay productos para mostrar con esos filtros.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((p) => (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-[24px] border border-[rgba(212,175,55,0.18)] bg-[#111] shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.3)]"
                >
                  <div className="flex h-[250px] items-center justify-center bg-[linear-gradient(180deg,#1a1a1a,#111)]">
                    {p.foto_url ? (
                      <img
                        src={p.foto_url}
                        alt={p.perfume}
                        className="h-full w-full object-contain p-3"
                      />
                    ) : (
                      <span className="text-sm text-[#9d8c5c]">Sin imagen</span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-3 min-h-[108px]">
                      <h3
                        className="line-clamp-2 min-h-[56px] text-lg font-semibold leading-7 text-[#d4af37]"
                        title={p.perfume}
                      >
                        {p.perfume}
                      </h3>
                      <p className="mt-1 text-sm text-[#d8c68f]">
                        {p.marca ?? "Sin marca"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(
                            p.categoria
                          )}`}
                        >
                          {p.categoria ?? "Sin categoría"}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${genderBadgeClass(
                            p.genero
                          )}`}
                        >
                          {p.genero ?? "Sin género"}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3 grid gap-2 text-sm">
                      {p.precio_5ml ? (
                        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[#f5e7c2]">
                          5 ml:{" "}
                          <span className="font-semibold text-[#d4af37]">
                            {formatPrice(p.precio_5ml)}
                          </span>
                        </div>
                      ) : null}

                      {p.precio_10ml ? (
                        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[#f5e7c2]">
                          10 ml:{" "}
                          <span className="font-semibold text-[#d4af37]">
                            {formatPrice(p.precio_10ml)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      {p.precio_5ml ? (
                        <button
                          onClick={() => addToCart(p, "5ml")}
                          className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-medium text-[#f5e7c2] transition hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.08)]"
                        >
                          Agregar 5 ml
                        </button>
                      ) : null}

                      {p.precio_10ml ? (
                        <button
                          onClick={() => addToCart(p, "10ml")}
                          className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-medium text-[#f5e7c2] transition hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.08)]"
                        >
                          Agregar 10 ml
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}