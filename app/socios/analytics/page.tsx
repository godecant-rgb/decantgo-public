"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../src/lib/supabase/client";

type OrderRow = {
  id: string;
  customer_name: string;
  city: string | null;
  status: string;
  channel: string | null;
  total: number | null;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  perfume_name: string;
  presentation: string;
  quantity: number;
  line_total: number | null;
};

function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toFixed(0)}`;
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isLast7Days(dateStr: string) {
  const d = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = now - d;
  return diff <= 7 * 24 * 60 * 60 * 1000;
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export default function SociosAnalyticsPage() {
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);

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

    const [ordersRes, itemsRes] = await Promise.all([
      supabase.from("public_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("public_order_items").select("*").order("created_at", { ascending: false }),
    ]);

    if (ordersRes.error) console.error("ANALYTICS ORDERS ERROR:", ordersRes.error);
    if (itemsRes.error) console.error("ANALYTICS ITEMS ERROR:", itemsRes.error);

    setOrders((ordersRes.data ?? []) as OrderRow[]);
    setItems((itemsRes.data ?? []) as OrderItemRow[]);
    setLoading(false);
  }

  const metrics = useMemo(() => {
    const salesToday = orders.filter((o) => isToday(o.created_at)).reduce((acc, o) => acc + Number(o.total ?? 0), 0);
    const salesWeek = orders.filter((o) => isLast7Days(o.created_at)).reduce((acc, o) => acc + Number(o.total ?? 0), 0);
    const salesMonth = orders.filter((o) => isThisMonth(o.created_at)).reduce((acc, o) => acc + Number(o.total ?? 0), 0);
    const ordersMonth = orders.filter((o) => isThisMonth(o.created_at)).length;
    const totalOrders = orders.length;
    const avgTicket = totalOrders ? orders.reduce((acc, o) => acc + Number(o.total ?? 0), 0) / totalOrders : 0;

    return { salesToday, salesWeek, salesMonth, ordersMonth, totalOrders, avgTicket };
  }, [orders]);

  const topPerfumes = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; amount: number }>();
    for (const item of items) {
      const key = item.perfume_name || "Sin nombre";
      const existing = map.get(key) || { name: key, qty: 0, amount: 0 };
      existing.qty += Number(item.quantity ?? 0);
      existing.amount += Number(item.line_total ?? 0);
      map.set(key, existing);
    }
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [items]);

  const topClients = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; count: number }>();
    for (const order of orders) {
      const key = order.customer_name || "Sin nombre";
      const existing = map.get(key) || { name: key, amount: 0, count: 0 };
      existing.amount += Number(order.total ?? 0);
      existing.count += 1;
      map.set(key, existing);
    }
    return Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [orders]);

  const salesByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of orders) {
      const key = order.status || "sin estado";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const salesByCity = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of orders) {
      const key = order.city || "Sin ciudad";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [orders]);

  if (!authorized) return null;

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.92)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b9962f]">Panel privado</p>
              <h1 className="mt-2 text-4xl font-bold text-[#d4af37]">Analytics</h1>
              <p className="mt-2 text-sm text-[#d8c68f]">
                Métricas clave del negocio para seguir ventas y rendimiento.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/socios/dashboard"
                className="rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm"
              >
                Volver
              </Link>
              <button
                onClick={loadData}
                className="rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-3 text-sm font-bold text-black"
              >
                Actualizar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 text-sm text-[#d8c68f]">Cargando métricas...</div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Ventas hoy", formatMoney(metrics.salesToday)],
                  ["Ventas últimos 7 días", formatMoney(metrics.salesWeek)],
                  ["Ventas del mes", formatMoney(metrics.salesMonth)],
                  ["Pedidos del mes", String(metrics.ordersMonth)],
                  ["Pedidos totales", String(metrics.totalOrders)],
                  ["Ticket promedio", formatMoney(metrics.avgTicket)],
                ].map(([title, value]) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5"
                  >
                    <div className="text-sm text-[#d8c68f]">{title}</div>
                    <div className="mt-2 text-3xl font-bold text-[#d4af37]">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Top perfumes</h2>
                  <div className="mt-4 grid gap-3">
                    {topPerfumes.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Sin datos.</div>
                    ) : (
                      topPerfumes.map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-3"
                        >
                          <div>
                            <div className="font-medium text-[#f5e7c2]">{p.name}</div>
                            <div className="text-sm text-[#d8c68f]">{p.qty} unidad(es)</div>
                          </div>
                          <div className="text-sm font-semibold text-[#d4af37]">{formatMoney(p.amount)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Top clientes</h2>
                  <div className="mt-4 grid gap-3">
                    {topClients.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Sin datos.</div>
                    ) : (
                      topClients.map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-3"
                        >
                          <div>
                            <div className="font-medium text-[#f5e7c2]">{c.name}</div>
                            <div className="text-sm text-[#d8c68f]">{c.count} pedido(s)</div>
                          </div>
                          <div className="text-sm font-semibold text-[#d4af37]">{formatMoney(c.amount)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Pedidos por estado</h2>
                  <div className="mt-4 grid gap-3">
                    {salesByStatus.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Sin datos.</div>
                    ) : (
                      salesByStatus.map(([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-3"
                        >
                          <div className="font-medium text-[#f5e7c2] capitalize">{status}</div>
                          <div className="text-sm font-semibold text-[#d4af37]">{count}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Pedidos por ciudad</h2>
                  <div className="mt-4 grid gap-3">
                    {salesByCity.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Sin datos.</div>
                    ) : (
                      salesByCity.map(([city, count]) => (
                        <div
                          key={city}
                          className="flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-3"
                        >
                          <div className="font-medium text-[#f5e7c2]">{city}</div>
                          <div className="text-sm font-semibold text-[#d4af37]">{count}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
