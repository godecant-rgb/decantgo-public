"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../src/lib/supabase/client";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string | null;
  instagram: string | null;
  city: string | null;
  channel: string | null;
  status: string;
  subtotal: number | null;
  discount: number | null;
  shipping_cost: number | null;
  total: number | null;
  notes: string | null;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  perfume_name: string;
  presentation: string;
  quantity: number;
  unit_price: number | null;
  line_total: number | null;
};

type ShippingRow = {
  id: string;
  order_id: string;
  recipient_name: string | null;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  reference: string | null;
  notes: string | null;
};

const STATUS_OPTIONS = ["pendiente", "pagado", "preparando", "enviado", "entregado", "cancelado"];

function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toFixed(0)}`;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-UY");
}

function dateInputValue(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function statusClasses(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "entregado") return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20";
  if (s === "enviado") return "bg-sky-500/15 text-sky-300 border border-sky-500/20";
  if (s === "pagado" || s === "preparando") return "bg-amber-500/15 text-amber-300 border border-amber-500/20";
  if (s === "cancelado") return "bg-rose-500/15 text-rose-300 border border-rose-500/20";
  return "bg-white/5 text-[#f5e7c2] border border-white/10";
}

function openPrintWindow(title: string, html: string) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) {
    alert("El navegador bloqueó la ventana de impresión.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.document.title = title;
  w.focus();
  setTimeout(() => w.print(), 500);
}

function buildOrderPdfHtml(order: OrderRow, items: OrderItemRow[], shipping: ShippingRow | null) {
  const itemsHtml = items.map((item) => `
    <tr>
      <td>${item.perfume_name}</td>
      <td>${item.presentation}</td>
      <td>${item.quantity}</td>
      <td>${formatMoney(item.unit_price)}</td>
      <td>${formatMoney(item.line_total)}</td>
    </tr>
  `).join("");

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Pedido ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
        .top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 24px; }
        .brand { font-size: 28px; font-weight: 700; color: #b8860b; }
        .muted { color: #555; }
        .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border-bottom: 1px solid #ddd; padding: 10px 8px; text-align:left; font-size: 14px; }
        th { background: #f7f7f7; }
        .total { font-size: 22px; font-weight: 700; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="top">
        <div>
          <div class="brand">Decant Go</div>
          <div class="muted">Comprobante de pedido</div>
        </div>
        <div>
          <div><strong>Pedido:</strong> ${order.order_number}</div>
          <div><strong>Fecha:</strong> ${formatDate(order.created_at)}</div>
          <div><strong>Estado:</strong> ${order.status}</div>
        </div>
      </div>
      <div class="card">
        <h3>Cliente</h3>
        <div><strong>Nombre:</strong> ${order.customer_name}</div>
        <div><strong>Teléfono:</strong> ${order.phone || "-"}</div>
        <div><strong>Instagram:</strong> ${order.instagram || "-"}</div>
        <div><strong>Ciudad:</strong> ${order.city || "-"}</div>
      </div>
      <div class="card">
        <h3>Envío</h3>
        <div><strong>Destinatario:</strong> ${shipping?.recipient_name || "-"}</div>
        <div><strong>Dirección:</strong> ${shipping?.address_line || "-"}</div>
        <div><strong>Ciudad:</strong> ${shipping?.city || "-"}</div>
        <div><strong>Referencia:</strong> ${shipping?.reference || "-"}</div>
      </div>
      <div class="card">
        <h3>Detalle del pedido</h3>
        <table>
          <thead>
            <tr>
              <th>Perfume</th>
              <th>Presentación</th>
              <th>Cantidad</th>
              <th>Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="total">Total: ${formatMoney(order.total)}</div>
      </div>
      <div class="card">
        <h3>Notas</h3>
        <div>${order.notes || shipping?.notes || "Sin notas."}</div>
      </div>
    </body>
  </html>`;
}

function buildLabelHtml(order: OrderRow, shipping: ShippingRow | null) {
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Etiqueta ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
        .label { border: 2px solid #111; border-radius: 16px; padding: 22px; width: 700px; }
        .brand { font-size: 24px; font-weight: 700; color: #b8860b; margin-bottom: 16px; }
        .line { margin-bottom: 10px; font-size: 18px; }
        .small { font-size: 14px; color: #555; }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="brand">Decant Go</div>
        <div class="line"><strong>Pedido:</strong> ${order.order_number}</div>
        <div class="line"><strong>Destinatario:</strong> ${shipping?.recipient_name || order.customer_name}</div>
        <div class="line"><strong>Teléfono:</strong> ${shipping?.phone || order.phone || "-"}</div>
        <div class="line"><strong>Dirección:</strong> ${shipping?.address_line || "-"}</div>
        <div class="line"><strong>Ciudad:</strong> ${shipping?.city || order.city || "-"}</div>
        <div class="line"><strong>Referencia:</strong> ${shipping?.reference || "-"}</div>
        <div class="small">Etiqueta interna de envío</div>
      </div>
    </body>
  </html>`;
}

export default function SociosPedidosPage() {
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [shipping, setShipping] = useState<ShippingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("dg_socios_auth");
    if (auth !== "ok") {
      window.location.href = "/socios/login";
      return;
    }
    setAuthorized(true);
  }, []);

  useEffect(() => {
    if (!authorized) return;
    loadAll();
  }, [authorized]);

  async function loadAll() {
    setLoading(true);
    const [ordersRes, itemsRes, shippingRes] = await Promise.all([
      supabase.from("public_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("public_order_items").select("*").order("created_at", { ascending: true }),
      supabase.from("shipping_addresses").select("*").order("created_at", { ascending: false }),
    ]);

    if (ordersRes.error) console.error("ORDERS ERROR:", ordersRes.error);
    if (itemsRes.error) console.error("ITEMS ERROR:", itemsRes.error);
    if (shippingRes.error) console.error("SHIPPING ERROR:", shippingRes.error);

    const loadedOrders = (ordersRes.data ?? []) as OrderRow[];
    setOrders(loadedOrders);
    setItems((itemsRes.data ?? []) as OrderItemRow[]);
    setShipping((shippingRes.data ?? []) as ShippingRow[]);

    if (!selectedOrderId && loadedOrders.length > 0) {
      setSelectedOrderId(loadedOrders[0].id);
    }
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setSavingId(orderId);
    const { error } = await supabase.from("public_orders").update({ status: newStatus }).eq("id", orderId);

    if (error) {
      console.error("UPDATE STATUS ERROR:", error);
      alert("No se pudo actualizar el estado.");
      setSavingId(null);
      return;
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setSavingId(null);
  }

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        [o.order_number, o.customer_name, o.phone ?? "", o.instagram ?? "", o.city ?? "", o.status ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesStatus = statusFilter === "todos" || (o.status || "").toLowerCase() === statusFilter;
      const orderDate = dateInputValue(o.created_at);
      const matchesFrom = !dateFrom || orderDate >= dateFrom;
      const matchesTo = !dateTo || orderDate <= dateTo;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ||
    orders.find((o) => o.id === selectedOrderId) ||
    null;

  const selectedItems = items.filter((i) => i.order_id === selectedOrder?.id);
  const selectedShipping = shipping.find((s) => s.order_id === selectedOrder?.id) || null;

  if (!authorized) return null;

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.92)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b9962f]">Panel privado</p>
              <h1 className="mt-2 text-4xl font-bold text-[#d4af37]">Pedidos</h1>
              <p className="mt-2 text-sm text-[#d8c68f]">Acá ves los pedidos que entran desde la web, podés filtrarlos y generar PDFs.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/socios/dashboard" className="rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm">Volver</Link>
              <button onClick={loadAll} className="rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-3 text-sm font-bold text-black">Actualizar</button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
            <div className="grid gap-4">
              <div className="grid gap-3 xl:grid-cols-[1fr_180px_160px_160px]">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por pedido, cliente, teléfono, Instagram, ciudad..." className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]">
                  <option value="todos">Todos los estados</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
              </div>

              <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-3">
                {loading ? (
                  <div className="p-4 text-sm text-[#d8c68f]">Cargando pedidos...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-4 text-sm text-[#d8c68f]">No hay pedidos para mostrar.</div>
                ) : (
                  <div className="grid gap-3">
                    {filteredOrders.map((order) => (
                      <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`rounded-[20px] border p-4 text-left transition ${selectedOrderId === order.id ? "border-[#d4af37] bg-[rgba(212,175,55,0.08)]" : "border-[rgba(212,175,55,0.10)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(212,175,55,0.22)]"}`}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-lg font-bold text-[#d4af37]">{order.order_number}</div>
                            <div className="mt-1 text-sm text-[#f5e7c2]">{order.customer_name}</div>
                            <div className="mt-1 text-xs text-[#cdbb7a]">{formatDate(order.created_at)}</div>
                          </div>
                          <div className="flex flex-col items-start gap-2 md:items-end">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses(order.status)}`}>{order.status}</span>
                            <div className="text-sm font-semibold text-[#f5e7c2]">{formatMoney(order.total)}</div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-[#d8c68f] md:grid-cols-3">
                          <div>Tel: {order.phone || "-"}</div>
                          <div>IG: {order.instagram || "-"}</div>
                          <div>Ciudad: {order.city || "-"}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
              {!selectedOrder ? (
                <div className="text-sm text-[#d8c68f]">Seleccioná un pedido para ver el detalle.</div>
              ) : (
                <div className="grid gap-5">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-[#b9962f]">Detalle</div>
                    <h2 className="mt-2 text-2xl font-bold text-[#d4af37]">{selectedOrder.order_number}</h2>
                    <p className="mt-1 text-sm text-[#d8c68f]">{selectedOrder.customer_name}</p>
                  </div>

                  <div className="grid gap-2 text-sm text-[#f5e7c2]">
                    <div><span className="text-[#d8c68f]">Teléfono:</span> {selectedOrder.phone || "-"}</div>
                    <div><span className="text-[#d8c68f]">Instagram:</span> {selectedOrder.instagram || "-"}</div>
                    <div><span className="text-[#d8c68f]">Ciudad:</span> {selectedOrder.city || "-"}</div>
                    <div><span className="text-[#d8c68f]">Canal:</span> {selectedOrder.channel || "-"}</div>
                    <div><span className="text-[#d8c68f]">Fecha:</span> {formatDate(selectedOrder.created_at)}</div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-[#d8c68f]">Estado del pedido</label>
                    <select value={selectedOrder.status} onChange={(e) => updateStatus(selectedOrder.id, e.target.value)} disabled={savingId === selectedOrder.id} className="w-full rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]">
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button onClick={() => openPrintWindow(`Pedido ${selectedOrder.order_number}`, buildOrderPdfHtml(selectedOrder, selectedItems, selectedShipping))} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-medium text-[#f5e7c2] transition hover:border-[#d4af37]">PDF pedido</button>
                    <button onClick={() => openPrintWindow(`Etiqueta ${selectedOrder.order_number}`, buildLabelHtml(selectedOrder, selectedShipping))} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-medium text-[#f5e7c2] transition hover:border-[#d4af37]">Etiqueta envío</button>
                  </div>

                  <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                    <div className="mb-3 text-sm font-semibold text-[#d4af37]">Items del pedido</div>
                    {selectedItems.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">No hay items registrados.</div>
                    ) : (
                      <div className="grid gap-3">
                        {selectedItems.map((item) => (
                          <div key={item.id} className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                            <div className="font-medium text-[#f5e7c2]">{item.perfume_name}</div>
                            <div className="mt-1 text-sm text-[#d8c68f]">{item.presentation} · {item.quantity} unidad(es)</div>
                            <div className="mt-1 text-sm text-[#d8c68f]">{formatMoney(item.unit_price)} c/u · Total {formatMoney(item.line_total)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                    <div className="mb-3 text-sm font-semibold text-[#d4af37]">Envío / dirección</div>
                    <div className="grid gap-2 text-sm text-[#f5e7c2]">
                      <div><span className="text-[#d8c68f]">Destinatario:</span> {selectedShipping?.recipient_name || "-"}</div>
                      <div><span className="text-[#d8c68f]">Teléfono:</span> {selectedShipping?.phone || "-"}</div>
                      <div><span className="text-[#d8c68f]">Dirección:</span> {selectedShipping?.address_line || "-"}</div>
                      <div><span className="text-[#d8c68f]">Ciudad:</span> {selectedShipping?.city || "-"}</div>
                      <div><span className="text-[#d8c68f]">Referencia:</span> {selectedShipping?.reference || "-"}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                    <div className="mb-2 text-sm font-semibold text-[#d4af37]">Resumen</div>
                    <div className="grid gap-2 text-sm text-[#f5e7c2]">
                      <div><span className="text-[#d8c68f]">Subtotal:</span> {formatMoney(selectedOrder.subtotal)}</div>
                      <div><span className="text-[#d8c68f]">Descuento:</span> {formatMoney(selectedOrder.discount)}</div>
                      <div><span className="text-[#d8c68f]">Envío:</span> {formatMoney(selectedOrder.shipping_cost)}</div>
                      <div className="pt-1 text-lg font-bold text-[#d4af37]">Total: {formatMoney(selectedOrder.total)}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                    <div className="mb-2 text-sm font-semibold text-[#d4af37]">Notas</div>
                    <p className="text-sm text-[#f5e7c2]">{selectedOrder.notes || selectedShipping?.notes || "Sin notas."}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
