"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../src/lib/supabase/client";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string | null;
  instagram: string | null;
  city: string | null;
  status: string;
  total: number | null;
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
  created_at?: string | null;
};

function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toFixed(0)}`;
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Sin fecha";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function SociosAnalyticsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);

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

    async function loadData() {
      setLoading(true);
      const supabase = createClient();

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

    loadData();
  }, [authorized]);

  const paidOrders = useMemo(() => {
    return orders.filter((o) =>
      ["pagado", "preparando", "enviado", "entregado"].includes(
        (o.status || "").toLowerCase()
      )
    );
  }, [orders]);

  const totalSales = useMemo(() => {
    return paidOrders.reduce((acc, o) => acc + Number(o.total ?? 0), 0);
  }, [paidOrders]);

  const averageTicket = useMemo(() => {
    if (paidOrders.length === 0) return 0;
    return totalSales / paidOrders.length;
  }, [paidOrders, totalSales]);

  const totalUnits = useMemo(() => {
    return items.reduce((acc, i) => acc + Number(i.quantity ?? 0), 0);
  }, [items]);

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
      .sort((a, b) => {
        if (b.qty !== a.qty) return b.qty - a.qty;
        return b.amount - a.amount;
      })
      .slice(0, 10);
  }, [items]);

  const topClients = useMemo(() => {
    const map = new Map<string, { name: string; orders: number; amount: number }>();

    for (const order of paidOrders) {
      const key = order.customer_name || "Sin nombre";
      const existing = map.get(key) || { name: key, orders: 0, amount: 0 };
      existing.orders += 1;
      existing.amount += Number(order.total ?? 0);
      map.set(key, existing);
    }

    return Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [paidOrders]);

  const salesByMonth = useMemo(() => {
    const map = new Map<string, { key: string; amount: number; orders: number }>();

    for (const order of paidOrders) {
      const key = monthKey(order.created_at);
      const existing = map.get(key) || { key, amount: 0, orders: 0 };
      existing.amount += Number(order.total ?? 0);
      existing.orders += 1;
      map.set(key, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [paidOrders]);

  const salesByPresentation = useMemo(() => {
    const map = new Map<string, { presentation: string; qty: number; amount: number }>();

    for (const item of items) {
      const key = item.presentation || "Sin dato";
      const existing = map.get(key) || { presentation: key, qty: 0, amount: 0 };
      existing.qty += Number(item.quantity ?? 0);
      existing.amount += Number(item.line_total ?? 0);
      map.set(key, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
  }, [items]);

  const salesByStatus = useMemo(() => {
    const map = new Map<string, { status: string; count: number; amount: number }>();

    for (const order of orders) {
      const key = order.status || "sin estado";
      const existing = map.get(key) || { status: key, count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += Number(order.total ?? 0);
      map.set(key, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [orders]);

  if (!authorized) return null;

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.92)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b9962f]">
                Panel privado
              </p>
              <h1 className="mt-2 text-4xl font-bold text-[#d4af37]">
                Analytics
              </h1>
              <p className="mt-2 text-sm text-[#d8c68f]">
                Métricas de ventas, perfumes, clientes y comportamiento general.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/socios/dashboard"
                className="rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm"
              >
                Volver
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 text-sm text-[#d8c68f]">Cargando analytics...</div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Ventas cobradas", formatMoney(totalSales)],
                  ["Pedidos cobrables", String(paidOrders.length)],
                  ["Ticket promedio", formatMoney(averageTicket)],
                  ["Unidades vendidas", String(totalUnits)],
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
                      <div className="text-sm text-[#d8c68f]">Sin datos todavía.</div>
                    ) : (
                      topPerfumes.map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4"
                        >
                          <div>
                            <div className="font-medium text-[#f5e7c2]">{p.name}</div>
                            <div className="text-sm text-[#d8c68f]">{p.qty} unidad(es)</div>
                          </div>
                          <div className="text-sm font-semibold text-[#d4af37]">
                            {formatMoney(p.amount)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Top clientes</h2>
                  <div className="mt-4 grid gap-3">
                    {topClients.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Sin datos todavía.</div>
                    ) : (
                      topClients.map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4"
                        >
                          <div>
                            <div className="font-medium text-[#f5e7c2]">{c.name}</div>
                            <div className="text-sm text-[#d8c68f]">{c.orders} pedido(s)</div>
                          </div>
                          <div className="text-sm font-semibold text-[#d4af37]">
                            {formatMoney(c.amount)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-3">
                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Ventas por mes</h2>
                  <div className="mt-4 grid gap-3">
                    {salesByMonth.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Sin datos todavía.</div>
                    ) : (
                      salesByMonth.map((m) => (
                        <div
                          key={m.key}
                          className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium text-[#f5e7c2]">{m.key}</div>
                              <div className="text-sm text-[#d8c68f]">{m.orders} pedido(s)</div>
                            </div>
                            <div className="text-sm font-semibold text-[#d4af37]">
                              {formatMoney(m.amount)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Presentaciones</h2>
                  <div className="mt-4 grid gap-3">
                    {salesByPresentation.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Sin datos todavía.</div>
                    ) : (
                      salesByPresentation.map((p) => (
                        <div
                          key={p.presentation}
                          className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium text-[#f5e7c2]">{p.presentation}</div>
                              <div className="text-sm text-[#d8c68f]">{p.qty} unidad(es)</div>
                            </div>
                            <div className="text-sm font-semibold text-[#d4af37]">
                              {formatMoney(p.amount)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Estados de pedidos</h2>
                  <div className="mt-4 grid gap-3">
                    {salesByStatus.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Sin datos todavía.</div>
                    ) : (
                      salesByStatus.map((s) => (
                        <div
                          key={s.status}
                          className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium text-[#f5e7c2]">{s.status}</div>
                              <div className="text-sm text-[#d8c68f]">{s.count} pedido(s)</div>
                            </div>
                            <div className="text-sm font-semibold text-[#d4af37]">
                              {formatMoney(s.amount)}
                            </div>
                          </div>
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
