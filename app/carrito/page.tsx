"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../src/lib/supabase/client";
import {
  CartItem,
  clearCart,
  getCart,
  removeCartItem,
  saveCart,
  updateCartItemQuantity,
} from "../../src/lib/cart";

function formatPrice(v: number | null | undefined) {
  return `$${Number(v ?? 0).toFixed(0)}`;
}

export default function CarritoPage() {
  const supabase = createClient();

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
                        {item.product.foto_url ? (
                          <img
                            src={item.product.foto_url}
                            alt={item.product.perfume}
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
      </div>
    </main>
  );
}