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

type ClientSummary = {
  name: string;
  phone: string;
  instagram: string;
  city: string;
  orders: number;
  amount: number;
  lastPurchase: string;
};

function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toFixed(0)}`;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-UY");
}

export default function SociosClientesPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [search, setSearch] = useState("");

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
      const { data, error } = await supabase
        .from("public_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("CLIENTES ORDERS ERROR:", error);
      setOrders((data ?? []) as OrderRow[]);
      setLoading(false);
    }

    loadData();
  }, [authorized]);

  const clients = useMemo(() => {
    const map = new Map<string, ClientSummary>();

    for (const o of orders) {
      const key = (o.customer_name || "Sin nombre").trim().toLowerCase();
      const existing = map.get(key) || {
        name: o.customer_name || "Sin nombre",
        phone: o.phone || "",
        instagram: o.instagram || "",
        city: o.city || "",
        orders: 0,
        amount: 0,
        lastPurchase: o.created_at,
      };

      existing.orders += 1;
      existing.amount += Number(o.total ?? 0);
      if (new Date(o.created_at) > new Date(existing.lastPurchase)) {
        existing.lastPurchase = o.created_at;
      }
      if (!existing.phone && o.phone) existing.phone = o.phone;
      if (!existing.instagram && o.instagram) existing.instagram = o.instagram;
      if (!existing.city && o.city) existing.city = o.city;

      map.set(key, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;

    return clients.filter((c) =>
      [c.name, c.phone, c.instagram, c.city].join(" ").toLowerCase().includes(q)
    );
  }, [clients, search]);

  if (!authorized) return null;

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.92)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b9962f]">Panel privado</p>
              <h1 className="mt-2 text-4xl font-bold text-[#d4af37]">Clientes</h1>
              <p className="mt-2 text-sm text-[#d8c68f]">Resumen de clientes, historial y monto total.</p>
            </div>

            <Link
              href="/socios/dashboard"
              className="rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm"
            >
              Volver
            </Link>
          </div>

          <div className="mt-8">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono, Instagram o ciudad..."
              className="w-full rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
            />
          </div>

          {loading ? (
            <div className="mt-8 text-sm text-[#d8c68f]">Cargando clientes...</div>
          ) : (
            <div className="mt-8 grid gap-4">
              {filtered.length === 0 ? (
                <div className="text-sm text-[#d8c68f]">No hay clientes para mostrar.</div>
              ) : (
                filtered.map((c) => (
                  <div
                    key={`${c.name}-${c.phone}-${c.instagram}`}
                    className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-xl font-bold text-[#d4af37]">{c.name}</div>
                        <div className="mt-1 text-sm text-[#d8c68f]">
                          {c.phone || "Sin teléfono"} {c.instagram ? `· ${c.instagram}` : ""} {c.city ? `· ${c.city}` : ""}
                        </div>
                        <div className="mt-1 text-xs text-[#bfae73]">
                          Última compra: {formatDate(c.lastPurchase)}
                        </div>
                      </div>

                      <div className="grid gap-2 text-right">
                        <div className="text-sm text-[#d8c68f]">{c.orders} pedido(s)</div>
                        <div className="text-lg font-semibold text-[#d4af37]">{formatMoney(c.amount)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
