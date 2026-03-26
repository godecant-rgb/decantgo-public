"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../src/lib/supabase/client";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  total: number | null;
  city: string | null;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  perfume_name: string;
  quantity: number;
  line_total: number | null;
};

function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toFixed(0)}`;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-UY");
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "entregado") return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20";
  if (s === "enviado") return "bg-sky-500/15 text-sky-300 border border-sky-500/20";
  if (s === "pagado" || s === "preparando") return "bg-amber-500/15 text-amber-300 border border-amber-500/20";
  if (s === "cancelado") return "bg-rose-500/15 text-rose-300 border border-rose-500/20";
  return "bg-white/5 text-[#f5e7c2] border border-white/10";
}

export default function SociosDashboardPage() {
  const supabase = createClient();

  const [user, setUser] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("dg_socios_auth");
    const savedUser = localStorage.getItem("dg_socios_user") || "";
    if (auth !== "ok") {
      window.location.href = "/socios/login";
      return;
    }
    setUser(savedUser);
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

    if (ordersRes.error) console.error("DASHBOARD ORDERS ERROR:", ordersRes.error);
    if (itemsRes.error) console.error("DASHBOARD ITEMS ERROR:", itemsRes.error);

    setOrders((ordersRes.data ?? []) as OrderRow[]);
    setItems((itemsRes.data ?? []) as OrderItemRow[]);
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem("dg_socios_auth");
    localStorage.removeItem("dg_socios_user");
    window.location.href = "/socios/login";
  }

  const metrics = useMemo(() => {
    const pending = orders.filter((o) => (o.status || "").toLowerCase() === "pendiente");
    const delivered = orders.filter((o) => (o.status || "").toLowerCase() === "entregado");
    const sent = orders.filter((o) => (o.status || "").toLowerCase() === "enviado");
    const monthOrders = orders.filter((o) => isThisMonth(o.created_at));
    const monthSales = monthOrders.reduce((acc, o) => acc + Number(o.total ?? 0), 0);

    const clientKeys = new Set(orders.map((o) => o.customer_name || "Sin nombre"));
    const pendingWithoutCity = pending.filter((o) => !o.city || !o.city.trim());

    return {
      pendingCount: pending.length,
      deliveredCount: delivered.length,
      sentCount: sent.length,
      monthSales,
      clientsCount: clientKeys.size,
      pendingWithoutCity: pendingWithoutCity.length,
    };
  }, [orders]);

  const latestOrders = useMemo(() => orders.slice(0, 6), [orders]);

  const topPerfumes = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; amount: number }>();
    for (const item of items) {
      const key = item.perfume_name || "Sin nombre";
      const existing = map.get(key) || { name: key, qty: 0, amount: 0 };
      existing.qty += Number(item.quantity ?? 0);
      existing.amount += Number(item.line_total ?? 0);
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [items]);

  const alerts = useMemo(() => {
    const list: { title: string; text: string }[] = [];
    const pending = orders.filter((o) => (o.status || "").toLowerCase() === "pendiente");
    const cancelled = orders.filter((o) => (o.status || "").toLowerCase() === "cancelado");

    if (pending.length > 0) {
      list.push({ title: "Pedidos pendientes", text: `Hay ${pending.length} pedido(s) esperando seguimiento.` });
    }

    const noCity = pending.filter((o) => !o.city || !o.city.trim());
    if (noCity.length > 0) {
      list.push({ title: "Pedidos sin ciudad", text: `Hay ${noCity.length} pedido(s) pendientes sin ciudad cargada.` });
    }

    if (cancelled.length > 0) {
      list.push({ title: "Pedidos cancelados", text: `Tenés ${cancelled.length} pedido(s) cancelados para revisar.` });
    }

    if (list.length === 0) {
      list.push({ title: "Todo en orden", text: "No hay alertas importantes por el momento." });
    }

    return list.slice(0, 4);
  }, [orders]);

  if (!authorized) return null;

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.92)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b9962f]">Panel privado</p>
              <h1 className="mt-2 text-4xl font-bold text-[#d4af37]">Dashboard socios</h1>
              <p className="mt-2 text-sm text-[#d8c68f]">Bienvenido{user ? `, ${user}` : ""}. Resumen general del negocio.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={loadData} className="rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-3 text-sm font-bold text-black">Actualizar</button>
              <button onClick={logout} className="rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm">Cerrar sesión</button>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 text-sm text-[#d8c68f]">Cargando dashboard...</div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Pedidos pendientes", String(metrics.pendingCount)],
                  ["Ventas del mes", formatMoney(metrics.monthSales)],
                  ["Clientes", String(metrics.clientsCount)],
                  ["Pedidos entregados", String(metrics.deliveredCount)],
                ].map(([title, value]) => (
                  <div key={title} className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                    <div className="text-sm text-[#d8c68f]">{title}</div>
                    <div className="mt-2 text-3xl font-bold text-[#d4af37]">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Pedidos", "Ver pedidos que llegan desde la web y actualizar su estado.", "/socios/pedidos"],
                  ["Clientes", "Consolidado de clientes, historial y total gastado.", "/socios/clientes"],
                  ["Analytics", "Ventas, top perfumes, top clientes y métricas clave.", "/socios/analytics"],
                  ["Finanzas", "Control entre socios, gastos y resultados del negocio.", "/socios/finanzas"],
                  ["Envíos", "Preparar pedidos, generar etiqueta y despachar.", "/socios/envios"],
                ].map(([title, text, href]) => (
                  <Link key={title} href={href} className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-6 transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.24)]">
                    <h2 className="text-2xl font-bold text-[#d4af37]">{title}</h2>
                    <p className="mt-2 text-sm text-[#d8c68f]">{text}</p>
                  </Link>
                ))}
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-[#d4af37]">Últimos pedidos</h2>
                    <Link href="/socios/pedidos" className="text-sm text-[#d8c68f] hover:text-[#d4af37]">Ver todos</Link>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {latestOrders.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Todavía no hay pedidos.</div>
                    ) : (
                      latestOrders.map((o) => (
                        <div key={o.id} className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="font-medium text-[#f5e7c2]">{o.order_number}</div>
                              <div className="text-sm text-[#d8c68f]">{o.customer_name}</div>
                              <div className="mt-1 text-xs text-[#cdbb7a]">{formatDate(o.created_at)}</div>
                            </div>
                            <div className="flex flex-col items-start gap-2 md:items-end">
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge(o.status)}`}>{o.status}</span>
                              <div className="text-sm font-semibold text-[#d4af37]">{formatMoney(o.total)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                    <h2 className="text-2xl font-bold text-[#d4af37]">Alertas</h2>
                    <div className="mt-4 grid gap-3">
                      {alerts.map((a) => (
                        <div key={a.title} className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                          <div className="font-medium text-[#f5e7c2]">{a.title}</div>
                          <div className="mt-1 text-sm text-[#d8c68f]">{a.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                    <h2 className="text-2xl font-bold text-[#d4af37]">Top perfumes</h2>
                    <div className="mt-4 grid gap-3">
                      {topPerfumes.length === 0 ? (
                        <div className="text-sm text-[#d8c68f]">Todavía no hay datos de perfumes.</div>
                      ) : (
                        topPerfumes.map((p) => (
                          <div key={p.name} className="flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-3">
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
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
