"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../src/lib/supabase/client";

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

type CartItem = {
  product: Product;
  presentacion: "5ml" | "10ml";
  cantidad: number;
  precio: number;
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

export default function CatalogoPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMarca, setSelectedMarca] = useState("todas");
  const [selectedCategoria, setSelectedCategoria] = useState("todas");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

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

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesSearch =
        !q ||
        [p.perfume, p.marca ?? "", p.categoria ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesMarca =
        selectedMarca === "todas" || (p.marca ?? "") === selectedMarca;

      const matchesCategoria =
        selectedCategoria === "todas" || (p.categoria ?? "") === selectedCategoria;

      return matchesSearch && matchesMarca && matchesCategoria;
    });
  }, [products, search, selectedMarca, selectedCategoria]);

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [cart]
  );

  function getPrice(product: Product, presentacion: "5ml" | "10ml") {
    if (presentacion === "5ml") return Number(product.precio_5ml ?? 0);
    return Number(product.precio_10ml ?? 0);
  }

  function addToCart(product: Product, presentacion: "5ml" | "10ml") {
    const precio = getPrice(product, presentacion);
    if (!precio || precio <= 0) return;

    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.product.id === product.id && i.presentacion === presentacion
      );

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], cantidad: copy[idx].cantidad + 1 };
        return copy;
      }

      return [...prev, { product, presentacion, cantidad: 1, precio }];
    });
  }

  function changeQty(index: number, qty: number) {
    setCart((prev) => {
      const copy = [...prev];

      if (qty <= 0) {
        copy.splice(index, 1);
      } else {
        copy[index] = { ...copy[index], cantidad: qty };
      }

      return copy;
    });
  }

  async function submitOrder() {
    if (!customerName.trim()) {
      alert("Ingresá el nombre del cliente.");
      return;
    }

    if (cart.length === 0) {
      alert("Agregá al menos un producto.");
      return;
    }

    const orderNumber = `DG-${new Date().getFullYear()}-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const { data: orderData, error: orderError } = await supabase
      .from("public_orders")
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        phone,
        instagram,
        city,
        channel: "web",
        status: "pendiente",
        subtotal: total,
        discount: 0,
        shipping_cost: 0,
        total,
        notes,
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error("ORDER ERROR FULL:", orderError);
      alert("No se pudo guardar el pedido.");
      return;
    }

    const itemsPayload = cart.map((item) => ({
      order_id: orderData.id,
      product_id: item.product.id,
      perfume_name: item.product.perfume,
      presentation: item.presentacion,
      quantity: item.cantidad,
      unit_price: item.precio,
      line_total: item.precio * item.cantidad,
    }));

    const { error: itemsError } = await supabase
      .from("public_order_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("ITEMS ERROR:", itemsError);
      alert("Se guardó el pedido, pero fallaron los items.");
      return;
    }

    const { error: addrError } = await supabase
      .from("shipping_addresses")
      .insert({
        order_id: orderData.id,
        recipient_name: customerName,
        phone,
        address_line: address,
        city,
        reference,
        notes,
      });

    if (addrError) {
      console.error("ADDRESS ERROR:", addrError);
      alert("Se guardó el pedido, pero falló la dirección.");
      return;
    }

    const rawLines = cart
      .map(
        (item) =>
          `- ${item.cantidad} x ${item.product.perfume} ${item.presentacion} = ${formatPrice(
            item.precio * item.cantidad
          )}`
      )
      .join("\n");

    const rawMsg =
      `Hola! Quiero confirmar este pedido:\n` +
      `Pedido: ${orderNumber}\n` +
      `Cliente: ${customerName}\n` +
      `${phone ? `Teléfono: ${phone}\n` : ""}` +
      `${instagram ? `Instagram: ${instagram}\n` : ""}` +
      `${city ? `Ciudad: ${city}\n` : ""}` +
      `${address ? `Dirección: ${address}\n` : ""}` +
      `${reference ? `Referencia: ${reference}\n` : ""}` +
      `\nProductos:\n${rawLines}\n\nTotal: ${formatPrice(total)}`;

    window.open(
      `https://wa.me/59895507692?text=${encodeURIComponent(rawMsg)}`,
      "_blank"
    );

    setCart([]);
    setCustomerName("");
    setPhone("");
    setInstagram("");
    setCity("");
    setAddress("");
    setReference("");
    setNotes("");

    alert(`Pedido ${orderNumber} guardado correctamente.`);
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

        <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
          <section>
            <div className="mb-5 rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(18,18,18,0.88)] p-4">
              <div className="grid gap-3 xl:grid-cols-[1fr_220px_220px]">
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
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>{c}</option>
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
                        <div className="mt-2">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(p.categoria)}`}>
                            {p.categoria ?? "Sin categoría"}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3 grid gap-2 text-sm">
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

          <aside
            id="pedido"
            className="top-24 h-fit rounded-[24px] border border-[rgba(212,175,55,0.18)] bg-[rgba(16,16,16,0.95)] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.22)] lg:sticky"
          >
            <h2 className="mb-4 text-2xl font-bold text-[#d4af37]">
              Tu pedido
            </h2>

            {cart.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[rgba(212,175,55,0.18)] px-4 py-6 text-sm text-[#cbb97b]">
                No agregaste productos todavía.
              </div>
            ) : (
              <div className="mb-5 grid gap-3">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.presentacion}`}
                    className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.02)] p-3"
                  >
                    <div className="font-semibold text-[#f5e7c2]">
                      {item.product.perfume}
                    </div>
                    <div className="mt-1 text-sm text-[#d8c68f]">
                      {item.presentacion} · {formatPrice(item.precio)} c/u
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={item.cantidad}
                      onChange={(e) => changeQty(idx, Number(e.target.value))}
                      className="mt-3 w-24 rounded-lg border border-[rgba(212,175,55,0.16)] bg-[#121212] px-3 py-2 text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mb-5 rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[rgba(212,175,55,0.06)] px-4 py-4">
              <div className="text-sm text-[#d8c68f]">Total estimado</div>
              <div className="mt-1 text-3xl font-bold text-[#d4af37]">
                {formatPrice(total)}
              </div>
            </div>

            <div className="grid gap-3">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre"
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono"
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
              />
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram"
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ciudad"
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
              />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección"
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
              />
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Referencia"
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas"
                rows={4}
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
              />

              <button
                onClick={submitOrder}
                className="mt-2 rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-4 text-sm font-bold text-black transition hover:scale-[1.01]"
              >
                Confirmar por WhatsApp
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
