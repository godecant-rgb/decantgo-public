"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../src/lib/supabase/client";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string | null;
  city: string | null;
  status: string;
  total: number | null;
  created_at: string;
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

const SHIPPING_STATUSES = ["pendiente", "pagado", "preparando", "enviado", "entregado"];

function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toFixed(0)}`;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-UY");
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

export default function SociosEnviosPage() {
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [shipping, setShipping] = useState<ShippingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("todos");
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
    loadData();
  }, [authorized]);

  async function loadData() {
    setLoading(true);
    const [ordersRes, shippingRes] = await Promise.all([
      supabase.from("public_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("shipping_addresses").select("*").order("created_at", { ascending: false }),
    ]);

    if (ordersRes.error) console.error("ENVIOS ORDERS ERROR:", ordersRes.error);
    if (shippingRes.error) console.error("ENVIOS SHIPPING ERROR:", shippingRes.error);

    const loadedOrders = (ordersRes.data ?? []) as OrderRow[];
    setOrders(loadedOrders);
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
      console.error("ENVIOS UPDATE ERROR:", error);
      alert("No se pudo actualizar el estado.");
      setSavingId(null);
      return;
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setSavingId(null);
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const allowed = SHIPPING_STATUSES.includes((o.status || "").toLowerCase());
      const matchesStatus = statusFilter === "todos" || (o.status || "").toLowerCase() === statusFilter;
      return allowed && matchesStatus;
    });
  }, [orders, statusFilter]);

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ||
    orders.find((o) => o.id === selectedOrderId) ||
    null;

  const selectedShipping = shipping.find((s) => s.order_id === selectedOrder?.id) || null;

  if (!authorized) return null;

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.92)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b9962f]">Panel privado</p>
              <h1 className="mt-2 text-4xl font-bold text-[#d4af37]">Envíos</h1>
              <p className="mt-2 text-sm text-[#d8c68f]">Prepará pedidos, revisá direcciones y generá etiquetas.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/socios/dashboard" className="rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm">Volver</Link>
              <button onClick={loadData} className="rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-3 text-sm font-bold text-black">Actualizar</button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]">
                <option value="todos">Todos</option>
                {SHIPPING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-3">
                {loading ? (
                  <div className="p-4 text-sm text-[#d8c68f]">Cargando envíos...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-4 text-sm text-[#d8c68f]">No hay pedidos para preparar.</div>
                ) : (
                  <div className="grid gap-3">
                    {filteredOrders.map((order) => {
                      const ship = shipping.find((s) => s.order_id === order.id) || null;
                      return (
                        <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`rounded-[20px] border p-4 text-left transition ${selectedOrderId === order.id ? "border-[#d4af37] bg-[rgba(212,175,55,0.08)]" : "border-[rgba(212,175,55,0.10)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(212,175,55,0.22)]"}`}>
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="text-lg font-bold text-[#d4af37]">{order.order_number}</div>
                              <div className="text-sm text-[#f5e7c2]">{ship?.recipient_name || order.customer_name}</div>
                              <div className="mt-1 text-xs text-[#cdbb7a]">{formatDate(order.created_at)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-[#d8c68f]">{ship?.city || order.city || "-"}</div>
                              <div className="text-sm font-semibold text-[#d4af37]">{formatMoney(order.total)}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
              {!selectedOrder ? (
                <div className="text-sm text-[#d8c68f]">Seleccioná un pedido para preparar el envío.</div>
              ) : (
                <div className="grid gap-5">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-[#b9962f]">Preparación</div>
                    <h2 className="mt-2 text-2xl font-bold text-[#d4af37]">{selectedOrder.order_number}</h2>
                    <p className="mt-1 text-sm text-[#d8c68f]">{selectedShipping?.recipient_name || selectedOrder.customer_name}</p>
                  </div>

                  <div className="grid gap-2 text-sm text-[#f5e7c2]">
                    <div><span className="text-[#d8c68f]">Teléfono:</span> {selectedShipping?.phone || selectedOrder.phone || "-"}</div>
                    <div><span className="text-[#d8c68f]">Dirección:</span> {selectedShipping?.address_line || "-"}</div>
                    <div><span className="text-[#d8c68f]">Ciudad:</span> {selectedShipping?.city || selectedOrder.city || "-"}</div>
                    <div><span className="text-[#d8c68f]">Referencia:</span> {selectedShipping?.reference || "-"}</div>
                    <div><span className="text-[#d8c68f]">Notas:</span> {selectedShipping?.notes || "-"}</div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-[#d8c68f]">Estado</label>
                    <select value={selectedOrder.status} onChange={(e) => updateStatus(selectedOrder.id, e.target.value)} disabled={savingId === selectedOrder.id} className="w-full rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]">
                      {SHIPPING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <button onClick={() => openPrintWindow(`Etiqueta ${selectedOrder.order_number}`, buildLabelHtml(selectedOrder, selectedShipping))} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-medium text-[#f5e7c2] transition hover:border-[#d4af37]">Imprimir etiqueta</button>
                    <button onClick={() => updateStatus(selectedOrder.id, "enviado")} className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm font-medium text-sky-300 transition hover:bg-sky-500/15">Marcar como enviado</button>
                    <button onClick={() => updateStatus(selectedOrder.id, "entregado")} className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/15">Marcar como entregado</button>
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
