"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import {
=======
import { createClient } from "../../src/lib/supabase/client";
import {
  CartItem,
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
<<<<<<< HEAD
  type CartItem,
=======
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
} from "../../src/lib/cart";

function formatPrice(v: number | null | undefined) {
  return `$${Number(v ?? 0).toFixed(0)}`;
}

<<<<<<< HEAD
type AppliedCoupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  first_purchase_only?: boolean | null;
};

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  function loadCart() {
    setItems(getCart());
  }

  useEffect(() => {
    loadCart();
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + Number(item.precio ?? 0) * Number(item.cantidad ?? 0),
      0
    );
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + Number(item.cantidad ?? 0), 0);
  }, [items]);

  const totalFinal = Math.max(0, subtotal - discountAmount);

  useEffect(() => {
    if (subtotal <= 0) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponMessage("");
    }
  }, [subtotal]);

  function changeQty(index: number, qty: number) {
    updateCartItemQuantity(index, qty);
    loadCart();

    if (qty <= 0) {
      setMessage("Producto eliminado del carrito");
      setTimeout(() => setMessage(""), 1600);
    }

    if (appliedCoupon) {
      setCouponMessage("El carrito cambió. Volvé a aplicar el cupón.");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }
  }

  function removeItem(index: number) {
    removeCartItem(index);
    loadCart();
    setMessage("Producto eliminado del carrito");
    setTimeout(() => setMessage(""), 1600);

    if (appliedCoupon) {
      setCouponMessage("El carrito cambió. Volvé a aplicar el cupón.");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }
  }

  function handleClearCart() {
    clearCart();
    loadCart();
    setMessage("Carrito vaciado");
    setTimeout(() => setMessage(""), 1600);

    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponMessage("");
    setCouponCode("");
  }

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponMessage("Ingresá un código de cupón.");
      return;
    }

    if (subtotal <= 0) {
      setCouponMessage("Tu carrito está vacío.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponMessage("");

      const res = await fetch("/api/socios/cupones/validar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          subtotal,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const raw = await res.text();
        console.error("Respuesta no JSON de /api/socios/cupones/validar:", raw);
        throw new Error(
          "La ruta /api/socios/cupones/validar no está devolviendo JSON."
        );
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo validar el cupón.");
      }

      setAppliedCoupon(data.coupon);
      setDiscountAmount(Number(data.discount ?? 0));
      setCouponCode(data.coupon.code);
      setCouponMessage(data.message || "Cupón aplicado correctamente.");
    } catch (error: any) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponMessage(error?.message || "No se pudo aplicar el cupón.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    setCouponMessage("Cupón removido.");
  }

  function buildWhatsAppMessage() {
    const lines = [
      "Hola, quiero confirmar este pedido de Decant Go:",
      "",
      ...items.map((item, index) => {
        const name = item.product.perfume;
        const ml = item.presentacion;
        const qty = item.cantidad;
        const subtotalLine =
          Number(item.precio ?? 0) * Number(item.cantidad ?? 0);
        return `${index + 1}. ${name} - ${ml} x${qty} — ${formatPrice(subtotalLine)}`;
      }),
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
    ];

    if (appliedCoupon) {
      lines.push(`Cupón aplicado: ${appliedCoupon.code}`);
      lines.push(`Descuento: ${formatPrice(discountAmount)}`);
    }

    lines.push(`Total de unidades: ${totalItems}`);
    lines.push(`Total final: ${formatPrice(totalFinal)}`);
    lines.push("");
    lines.push("Datos del cliente:");
    lines.push(`Nombre: ${customerName || "-"}`);
    lines.push(`Teléfono: ${customerPhone || "-"}`);
    lines.push(`Ciudad: ${customerCity || "-"}`);
    lines.push(`Dirección: ${customerAddress || "-"}`);
    lines.push(`Notas: ${customerNotes || "-"}`);

    return encodeURIComponent(lines.join("\n"));
  }

  const whatsappHref = `https://wa.me/59895507692?text=${buildWhatsAppMessage()}`;

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
                Tu carrito
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#e2cf9b] md:text-base">
                Revisá tu selección, completá tus datos y confirmá tu pedido por WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-2 text-xs font-medium text-[#f4e7c3]">
                {totalItems} {totalItems === 1 ? "unidad" : "unidades"}
              </span>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-300">
                Total {formatPrice(totalFinal)}
              </span>
            </div>
          </div>
        </section>

        {message ? (
          <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        ) : null}

        {items.length === 0 ? (
          <section className="rounded-[28px] border border-[rgba(223,190,86,0.12)] bg-[rgba(34,27,20,0.82)] p-8 text-center">
            <h2 className="text-2xl font-semibold text-[#f4e7c3]">
              Tu carrito está vacío
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#e2cf9b]">
              Todavía no agregaste fragancias. Explorá el catálogo y descubrí opciones para vos.
            </p>

            <div className="mt-6">
              <Link
                href="/catalogo"
                className="inline-flex rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-6 py-3 text-sm font-bold text-black shadow-[0_12px_28px_rgba(223,190,86,0.16)] transition hover:scale-[1.02]"
              >
                Ir al catálogo
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4">
              {items.map((item, index) => {
                const subtotalLine =
                  Number(item.precio ?? 0) * Number(item.cantidad ?? 0);

                return (
                  <article
                    key={`${item.product.id}-${item.presentacion}-${index}`}
                    className="overflow-hidden rounded-[26px] border border-[rgba(223,190,86,0.16)] bg-[#1c1611] shadow-[0_14px_35px_rgba(0,0,0,0.18)]"
                  >
                    <div className="grid gap-0 md:grid-cols-[180px_1fr]">
                      <div className="flex h-[220px] items-center justify-center bg-[linear-gradient(180deg,#241d17,#18130f)] p-4">
=======
export default function CarritoPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [cart]
  );

  function increaseQty(index: number) {
    const item = cart[index];
    const updated = updateCartItemQuantity(index, item.cantidad + 1);
    setCart(updated);
  }

  function decreaseQty(index: number) {
    const item = cart[index];
    const updated = updateCartItemQuantity(index, item.cantidad - 1);
    setCart(updated);
  }

  function removeItem(index: number) {
    const updated = removeCartItem(index);
    setCart(updated);
  }

  async function submitOrder() {
    if (!customerName.trim()) {
      alert("Ingresá el nombre del cliente.");
      return;
    }

    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const supabase = createClient();

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
      `https://wa.me/59800000000?text=${encodeURIComponent(rawMsg)}`,
      "_blank"
    );

    clearCart();
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
    <main className="min-h-screen px-4 py-8 text-[#f5e7c2] md:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-[28px] border border-[rgba(212,175,55,0.20)] bg-[linear-gradient(135deg,#121212,#1b1205)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#b9962f]">
                Decant Go
              </p>
              <h1 className="text-3xl font-bold text-[#d4af37] md:text-5xl">
                Tu carrito
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#e8d8a6] md:text-base">
                Revisá tus perfumes, ajustá cantidades y enviá tu pedido.
              </p>
            </div>

            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm font-medium text-[#f5e7c2]"
            >
              Seguir comprando
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
            <h2 className="mb-4 text-2xl font-bold text-[#d4af37]">
              Productos ({cart.reduce((acc, item) => acc + item.cantidad, 0)})
            </h2>

            {cart.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[rgba(212,175,55,0.18)] px-4 py-6 text-sm text-[#cbb97b]">
                Tu carrito está vacío.
              </div>
            ) : (
              <div className="grid gap-4">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.presentacion}-${idx}`}
                    className="rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(0,0,0,0.18)] p-4"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#1a1a1a,#111)]">
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
                        {item.product.foto_url ? (
                          <img
                            src={item.product.foto_url}
                            alt={item.product.perfume}
<<<<<<< HEAD
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-sm text-[#bfa66a]">Sin imagen</span>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="max-w-xl">
                            <h2 className="text-2xl font-semibold text-[#f4e7c3]">
                              {item.product.perfume}
                            </h2>

                            <p className="mt-1 text-sm text-[#e2cf9b]">
                              {item.product.marca ?? "Sin marca"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full border border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.05)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#f4e7c3]">
                                {item.presentacion}
                              </span>

                              {item.product.categoria ? (
                                <span className="rounded-full border border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.05)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#f4e7c3]">
                                  {item.product.categoria}
                                </span>
                              ) : null}

                              {item.product.genero ? (
                                <span className="rounded-full border border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.05)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#f4e7c3]">
                                  {item.product.genero}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(index)}
                            className="rounded-full border border-[rgba(223,190,86,0.16)] px-4 py-2 text-sm text-[#e2cf9b] transition hover:border-[rgba(223,190,86,0.28)] hover:bg-[rgba(223,190,86,0.06)] hover:text-[#fff1c7]"
                          >
                            Quitar
                          </button>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.18em] text-[#b59a5d]">
                              Precio unitario
                            </div>
                            <div className="mt-1 text-base font-semibold text-[#e7c96a]">
                              {formatPrice(item.precio)}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.18em] text-[#b59a5d]">
                              Cantidad
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => changeQty(index, item.cantidad - 1)}
                                className="h-9 w-9 rounded-full border border-[rgba(223,190,86,0.16)] text-sm text-[#f4e7c3] transition hover:border-[#dfbe56] hover:bg-[rgba(223,190,86,0.08)]"
                              >
                                −
                              </button>

                              <div className="min-w-[42px] text-center text-sm font-semibold text-[#f4e7c3]">
                                {item.cantidad}
                              </div>

                              <button
                                onClick={() => changeQty(index, item.cantidad + 1)}
                                className="h-9 w-9 rounded-full border border-[rgba(223,190,86,0.16)] text-sm text-[#f4e7c3] transition hover:border-[#dfbe56] hover:bg-[rgba(223,190,86,0.08)]"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.18em] text-[#b59a5d]">
                              Subtotal
                            </div>
                            <div className="mt-1 text-base font-semibold text-[#e7c96a]">
                              {formatPrice(subtotalLine)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              <section className="rounded-[28px] border border-[rgba(223,190,86,0.14)] bg-[rgba(34,27,20,0.82)] p-6 shadow-[0_14px_35px_rgba(0,0,0,0.16)]">
                <p className="text-[11px] uppercase tracking-[0.34em] text-[#bfa66a]">
                  Datos del pedido
                </p>
                <h2 className="mt-3 text-2xl font-bold text-[#f4e7c3]">
                  Completá tus datos
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#e2cf9b]">
                      Nombre
                    </label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input-premium"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#e2cf9b]">
                      Teléfono
                    </label>
                    <input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="input-premium"
                      placeholder="Tu teléfono"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#e2cf9b]">
                      Ciudad
                    </label>
                    <input
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="input-premium"
                      placeholder="Tu ciudad"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#e2cf9b]">
                      Dirección
                    </label>
                    <input
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="input-premium"
                      placeholder="Dirección de envío o retiro"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-[#e2cf9b]">
                    Notas
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={4}
                    className="input-premium resize-none"
                    placeholder="Ej: retirar en agencia, horario preferido, etc."
                  />
                </div>
              </section>
            </section>

            <aside className="h-fit rounded-[28px] border border-[rgba(223,190,86,0.14)] bg-[rgba(34,27,20,0.82)] p-6 shadow-[0_14px_35px_rgba(0,0,0,0.16)] lg:sticky lg:top-24">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[#bfa66a]">
                Resumen
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#f4e7c3]">
                Confirmar pedido
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#e2cf9b]">
                Aplicá un cupón si tenés uno y enviá el pedido por WhatsApp.
              </p>

              <div className="mt-6 rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] p-4">
                <div className="text-sm font-medium text-[#f4e7c3]">Cupón</div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Código"
                    className="input-premium"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-4 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {couponLoading ? "Validando..." : "Aplicar"}
                  </button>

                  {appliedCoupon ? (
                    <button
                      onClick={removeCoupon}
                      className="rounded-full border border-[rgba(223,190,86,0.16)] px-4 py-2 text-sm text-[#e2cf9b] transition hover:border-[rgba(223,190,86,0.28)] hover:bg-[rgba(223,190,86,0.06)] hover:text-[#fff1c7]"
                    >
                      Quitar cupón
                    </button>
                  ) : null}
                </div>

                {couponMessage ? (
                  <div className="mt-3 text-sm text-[#e2cf9b]">{couponMessage}</div>
                ) : null}

                {appliedCoupon ? (
                  <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                    Cupón activo: {appliedCoupon.code}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3 text-sm text-[#f4e7c3]">
                  <span>Unidades</span>
                  <span className="font-semibold text-[#e7c96a]">{totalItems}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3 text-sm text-[#f4e7c3]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#e7c96a]">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3 text-sm text-[#f4e7c3]">
                  <span>Descuento</span>
                  <span className="font-semibold text-[#e7c96a]">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3 text-sm text-[#f4e7c3]">
                  <span>Total final</span>
                  <span className="font-semibold text-[#e7c96a]">{formatPrice(totalFinal)}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-5 py-3 text-sm font-bold text-black shadow-[0_12px_28px_rgba(223,190,86,0.16)] transition hover:scale-[1.02]"
                >
                  Confirmar por WhatsApp
                </a>

                <button
                  onClick={handleClearCart}
                  className="rounded-full border border-[rgba(223,190,86,0.16)] px-5 py-3 text-sm text-[#e2cf9b] transition hover:border-[rgba(223,190,86,0.28)] hover:bg-[rgba(223,190,86,0.06)] hover:text-[#fff1c7]"
                >
                  Vaciar carrito
                </button>

                <Link
                  href="/catalogo"
                  className="rounded-full border border-[rgba(223,190,86,0.16)] px-5 py-3 text-center text-sm text-[#e2cf9b] transition hover:border-[rgba(223,190,86,0.28)] hover:bg-[rgba(223,190,86,0.06)] hover:text-[#fff1c7]"
                >
                  Seguir comprando
                </Link>
              </div>
            </aside>
          </div>
        )}
=======
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-xs text-[#9d8c5c]">Sin imagen</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-[#f5e7c2]">
                          {item.product.perfume}
                        </div>
                        <div className="mt-1 text-sm text-[#d8c68f]">
                          {item.presentacion} · {formatPrice(item.precio)} c/u
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => decreaseQty(idx)}
                            className="rounded-lg border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm"
                          >
                            -
                          </button>

                          <span className="min-w-10 text-center text-sm font-semibold text-[#d4af37]">
                            {item.cantidad}
                          </span>

                          <button
                            onClick={() => increaseQty(idx)}
                            className="rounded-lg border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm"
                          >
                            +
                          </button>

                          <button
                            onClick={() => removeItem(idx)}
                            className="ml-auto rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    clearCart();
                    setCart([]);
                  }}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-[24px] border border-[rgba(212,175,55,0.18)] bg-[rgba(16,16,16,0.95)] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
            <h2 className="mb-4 text-2xl font-bold text-[#d4af37]">
              Confirmar pedido
            </h2>

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
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
      </div>
    </main>
  );
}