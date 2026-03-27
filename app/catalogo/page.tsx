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
<<<<<<< HEAD
  perfil: string | null;
=======
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
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
<<<<<<< HEAD
  return "border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.05)] text-[#f4e7c3]";
=======
  return "border-white/10 bg-white/5 text-[#f5e7c2]";
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
}

function genderBadgeClass(gender: string | null) {
  const g = (gender || "").toLowerCase();
  if (g === "hombre") return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  if (g === "mujer") return "border-pink-500/20 bg-pink-500/10 text-pink-300";
  if (g === "unisex") return "border-violet-500/20 bg-violet-500/10 text-violet-300";
<<<<<<< HEAD
  return "border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.05)] text-[#f4e7c3]";
=======
  return "border-white/10 bg-white/5 text-[#f5e7c2]";
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
}

export default function CatalogoPage() {
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
      const supabase = createClient();

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
  }, []);

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
<<<<<<< HEAD
        [
          p.perfume,
          p.marca ?? "",
          p.categoria ?? "",
          p.genero ?? "",
          p.perfil ?? "",
        ]
=======
        [p.perfume, p.marca ?? "", p.categoria ?? "", p.genero ?? ""]
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
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

<<<<<<< HEAD
  function clearFilters() {
    setSearch("");
    setSelectedMarca("todas");
    setSelectedCategoria("todas");
    setSelectedGenero("todos");
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 text-[#f4e7c3] md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-8 overflow-hidden rounded-[30px] border border-[rgba(223,190,86,0.18)] bg-[linear-gradient(135deg,#1f1812_0%,#271d12_55%,#18130f_100%)] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,190,86,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(200,146,25,0.10),transparent_26%)]" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-[#bfa66a]">
                Decant Go
              </p>
              <h1 className="text-3xl font-bold leading-tight text-[#f4e7c3] md:text-5xl">
                Catálogo premium
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#e2cf9b] md:text-base">
                Explorá perfumes árabes y de diseñador en presentación de 5 ml y 10 ml.
                Descubrí fragancias con identidad, presencia y estilo.
=======
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
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-300">
                Envíos por DAC
              </span>
<<<<<<< HEAD
              <span className="rounded-full border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-2 text-xs font-medium text-[#f4e7c3]">
=======
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-[#f5e7c2]">
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
                Retiro en Sauce, Canelones
              </span>
            </div>
          </div>
        </section>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/carrito"
<<<<<<< HEAD
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-5 py-3 text-sm font-bold text-black shadow-[0_12px_28px_rgba(223,190,86,0.16)] transition hover:scale-[1.02]"
=======
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-3 text-sm font-bold text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
          >
            🛒 Ver carrito
            <span className="rounded-full bg-black/20 px-2 py-1 text-xs text-white">
              {cartCount}
            </span>
          </Link>

          {addedMessage ? (
<<<<<<< HEAD
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {addedMessage}
            </div>
          ) : (
            <div className="text-sm text-[#bfa66a]">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "fragancia" : "fragancias"} disponibles
            </div>
          )}
        </div>

        <section>
          <div className="mb-6 rounded-[26px] border border-[rgba(223,190,86,0.12)] bg-[rgba(34,27,20,0.82)] p-4 md:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#f4e7c3]">
                  Filtrar catálogo
                </h2>
                <p className="mt-1 text-sm text-[#bfa66a]">
                  Buscá por perfume, marca, categoría, género o perfil.
                </p>
              </div>

              <button
                onClick={clearFilters}
                className="rounded-full border border-[rgba(223,190,86,0.16)] px-4 py-2 text-sm text-[#e2cf9b] transition hover:border-[rgba(223,190,86,0.28)] hover:bg-[rgba(223,190,86,0.06)] hover:text-[#fff1c7]"
              >
                Limpiar filtros
              </button>
            </div>

=======
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {addedMessage}
            </div>
          ) : null}
        </div>

        <section>
          <div className="mb-5 rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(18,18,18,0.88)] p-4">
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
            <div className="grid gap-3 xl:grid-cols-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
<<<<<<< HEAD
                placeholder="Buscar perfume, marca, categoría o perfil..."
                className="w-full rounded-2xl border border-[rgba(223,190,86,0.16)] bg-[#1b1611] px-4 py-3 text-white outline-none transition placeholder:text-[#b59a5d] focus:border-[#dfbe56]"
=======
                placeholder="Buscar perfume, marca o categoría..."
                className="w-full rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none transition placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
              />

              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
<<<<<<< HEAD
                className="rounded-2xl border border-[rgba(223,190,86,0.16)] bg-[#1b1611] px-4 py-3 text-white outline-none transition focus:border-[#dfbe56]"
=======
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
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
<<<<<<< HEAD
                className="rounded-2xl border border-[rgba(223,190,86,0.16)] bg-[#1b1611] px-4 py-3 text-white outline-none transition focus:border-[#dfbe56]"
=======
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
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
<<<<<<< HEAD
                className="rounded-2xl border border-[rgba(223,190,86,0.16)] bg-[#1b1611] px-4 py-3 text-white outline-none transition focus:border-[#dfbe56]"
=======
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
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
<<<<<<< HEAD
            <div className="rounded-[24px] border border-[rgba(223,190,86,0.12)] bg-[rgba(34,27,20,0.82)] p-6 text-[#e2cf9b]">
              Cargando catálogo...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[24px] border border-[rgba(223,190,86,0.12)] bg-[rgba(34,27,20,0.82)] p-8 text-center">
              <h3 className="text-xl font-semibold text-[#f4e7c3]">
                No encontramos fragancias con esos filtros
              </h3>
              <p className="mt-2 text-sm text-[#e2cf9b]">
                Probá limpiando filtros o usando otra búsqueda.
              </p>
              <button
                onClick={clearFilters}
                className="mt-5 rounded-full border border-[rgba(223,190,86,0.16)] px-5 py-2.5 text-sm text-[#e2cf9b] transition hover:border-[rgba(223,190,86,0.28)] hover:bg-[rgba(223,190,86,0.06)] hover:text-[#fff1c7]"
              >
                Limpiar filtros
              </button>
=======
            <div className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(17,17,17,0.86)] p-6">
              Cargando catálogo...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(17,17,17,0.86)] p-6">
              No hay productos para mostrar con esos filtros.
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((p) => (
                <article
                  key={p.id}
<<<<<<< HEAD
                  className="group overflow-hidden rounded-[26px] border border-[rgba(223,190,86,0.16)] bg-[#1c1611] shadow-[0_14px_35px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(223,190,86,0.30)]"
                >
                  <div className="relative flex h-[270px] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#241d17,#18130f)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(223,190,86,0.10),transparent_35%)] opacity-0 transition duration-300 group-hover:opacity-100" />
=======
                  className="overflow-hidden rounded-[24px] border border-[rgba(212,175,55,0.18)] bg-[#111] shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.3)]"
                >
                  <div className="flex h-[250px] items-center justify-center bg-[linear-gradient(180deg,#1a1a1a,#111)]">
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
                    {p.foto_url ? (
                      <img
                        src={p.foto_url}
                        alt={p.perfume}
<<<<<<< HEAD
                        className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="text-sm text-[#bfa66a]">Sin imagen</span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-4 min-h-[138px]">
                      <h3
                        className="line-clamp-2 min-h-[58px] text-xl font-semibold leading-8 text-[#f4e7c3]"
=======
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
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
                        title={p.perfume}
                      >
                        {p.perfume}
                      </h3>
<<<<<<< HEAD

                      <div className="mt-1.5">
                        <p className="text-sm text-[#e2cf9b]">
                          {p.marca ?? "Sin marca"}
                        </p>

                        {p.perfil ? (
                          <div className="mt-2 inline-flex rounded-full border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-3 py-1 text-xs text-[#bfa66a]">
                            {p.perfil}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${badgeClass(
=======
                      <p className="mt-1 text-sm text-[#d8c68f]">
                        {p.marca ?? "Sin marca"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
                            p.categoria
                          )}`}
                        >
                          {p.categoria ?? "Sin categoría"}
                        </span>

                        <span
<<<<<<< HEAD
                          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${genderBadgeClass(
=======
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${genderBadgeClass(
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
                            p.genero
                          )}`}
                        >
                          {p.genero ?? "Sin género"}
                        </span>
                      </div>
                    </div>

<<<<<<< HEAD
                    <div className="mb-4 grid gap-2 text-sm">
                      {p.precio_5ml ? (
                        <div className="rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3 text-[#f4e7c3]">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#b59a5d]">
                            Presentación
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span>5 ml</span>
                            <span className="font-semibold text-[#e7c96a]">
                              {formatPrice(p.precio_5ml)}
                            </span>
                          </div>
=======
                    <div className="mb-3 grid gap-2 text-sm">
                      {p.precio_5ml ? (
                        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[#f5e7c2]">
                          5 ml:{" "}
                          <span className="font-semibold text-[#d4af37]">
                            {formatPrice(p.precio_5ml)}
                          </span>
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
                        </div>
                      ) : null}

                      {p.precio_10ml ? (
<<<<<<< HEAD
                        <div className="rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3 text-[#f4e7c3]">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#b59a5d]">
                            Presentación
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span>10 ml</span>
                            <span className="font-semibold text-[#e7c96a]">
                              {formatPrice(p.precio_10ml)}
                            </span>
                          </div>
=======
                        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[#f5e7c2]">
                          10 ml:{" "}
                          <span className="font-semibold text-[#d4af37]">
                            {formatPrice(p.precio_10ml)}
                          </span>
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      {p.precio_5ml ? (
                        <button
                          onClick={() => addToCart(p, "5ml")}
<<<<<<< HEAD
                          className="rounded-2xl border border-[rgba(223,190,86,0.16)] bg-[rgba(255,248,235,0.04)] px-4 py-3 text-sm font-medium text-[#f4e7c3] transition hover:border-[#dfbe56] hover:bg-[rgba(223,190,86,0.08)]"
=======
                          className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-medium text-[#f5e7c2] transition hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.08)]"
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
                        >
                          Agregar 5 ml
                        </button>
                      ) : null}

                      {p.precio_10ml ? (
                        <button
                          onClick={() => addToCart(p, "10ml")}
<<<<<<< HEAD
                          className="rounded-2xl bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-4 py-3 text-sm font-bold text-black shadow-[0_10px_20px_rgba(223,190,86,0.14)] transition hover:scale-[1.01]"
=======
                          className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-medium text-[#f5e7c2] transition hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.08)]"
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
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

      {cartCount > 0 ? (
        <Link
          href="/carrito"
<<<<<<< HEAD
          className="fixed bottom-24 right-5 z-50 flex items-center justify-center rounded-full border border-[rgba(223,190,86,0.18)] bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-3 py-3 text-black shadow-[0_10px_30px_rgba(0,0,0,0.30)] transition hover:scale-[1.03]"
=======
          className="fixed bottom-24 right-5 z-50 flex items-center justify-center rounded-full border border-[rgba(212,175,55,0.18)] bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-3 py-3 text-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:scale-[1.03]"
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
          aria-label={`Ver carrito (${cartCount})`}
          title={`Ver carrito (${cartCount})`}
        >
          <span className="text-base">🛒</span>
          <span className="absolute -right-1 -top-1 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">
            {cartCount}
          </span>
        </Link>
      ) : null}
    </main>
  );
}