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
  status: string;
  total: number | null;
  notes: string | null;
  created_at: string;
};

type ClientSummary = {
  key: string;
  customer_name: string;
  phone: string;
  instagram: string;
  city: string;
  orders_count: number;
  total_spent: number;
  last_order_at: string;
  notes: string;
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
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

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
    loadOrders();
  }, [authorized]);

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("public_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CLIENTES ORDERS ERROR:", error);
    }

    const loaded = (data ?? []) as OrderRow[];
    setOrders(loaded);
    setLoading(false);
  }

  const clients = useMemo(() => {
    const map = new Map<string, ClientSummary>();

    for (const order of orders) {
      const key =
        (order.phone && order.phone.trim()) ||
        (order.instagram && order.instagram.trim()) ||
        `${order.customer_name}-${order.city ?? ""}`;

      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          key,
          customer_name: order.customer_name || "Sin nombre",
          phone: order.phone || "",
          instagram: order.instagram || "",
          city: order.city || "",
          orders_count: 1,
          total_spent: Number(order.total ?? 0),
          last_order_at: order.created_at,
          notes: order.notes || "",
        });
      } else {
        existing.orders_count += 1;
        existing.total_spent += Number(order.total ?? 0);

        const currentDate = new Date(existing.last_order_at).getTime();
        const newDate = new Date(order.created_at).getTime();
        if (newDate > currentDate) {
          existing.last_order_at = order.created_at;
          existing.city = order.city || existing.city;
          existing.notes = order.notes || existing.notes;
          if (order.phone) existing.phone = order.phone;
          if (order.instagram) existing.instagram = order.instagram;
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.last_order_at).getTime() - new Date(a.last_order_at).getTime()
    );
  }, [orders]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.customer_name, c.phone, c.instagram, c.city, c.notes]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clients, search]);

  const selectedClient =
    filteredClients.find((c) => c.key === selectedKey) ||
    clients.find((c) => c.key === selectedKey) ||
    null;

  const selectedOrders = useMemo(() => {
    if (!selectedClient) return [];
    return orders.filter((order) => {
      const key =
        (order.phone && order.phone.trim()) ||
        (order.instagram && order.instagram.trim()) ||
        `${order.customer_name}-${order.city ?? ""}`;
      return key === selectedClient.key;
    });
  }, [orders, selectedClient]);

  useEffect(() => {
    if (!selectedKey && filteredClients.length > 0) {
      setSelectedKey(filteredClients[0].key);
    }
  }, [filteredClients, selectedKey]);

  if (!authorized) return null;

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.92)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b9962f]">Panel privado</p>
              <h1 className="mt-2 text-4xl font-bold text-[#d4af37]">Clientes</h1>
              <p className="mt-2 text-sm text-[#d8c68f]">
                Vista consolidada de clientes que compraron desde la web.
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
                onClick={loadOrders}
                className="rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-3 text-sm font-bold text-black"
              >
                Actualizar
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, teléfono, Instagram, ciudad..."
                className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]"
              />

              <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-3">
                {loading ? (
                  <div className="p-4 text-sm text-[#d8c68f]">Cargando clientes...</div>
                ) : filteredClients.length === 0 ? (
                  <div className="p-4 text-sm text-[#d8c68f]">No hay clientes para mostrar.</div>
                ) : (
                  <div className="grid gap-3">
                    {filteredClients.map((client) => (
                      <button
                        key={client.key}
                        onClick={() => setSelectedKey(client.key)}
                        className={`rounded-[20px] border p-4 text-left transition ${
                          selectedKey === client.key
                            ? "border-[#d4af37] bg-[rgba(212,175,55,0.08)]"
                            : "border-[rgba(212,175,55,0.10)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(212,175,55,0.22)]"
                        }`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-lg font-bold text-[#d4af37]">{client.customer_name}</div>
                            <div className="mt-1 text-sm text-[#f5e7c2]">
                              {client.phone || client.instagram || "Sin contacto"}
                            </div>
                            <div className="mt-1 text-xs text-[#cdbb7a]">
                              Última compra: {formatDate(client.last_order_at)}
                            </div>
                          </div>
                          <div className="flex flex-col items-start gap-1 md:items-end">
                            <div className="text-sm font-semibold text-[#f5e7c2]">
                              {client.orders_count} pedido(s)
                            </div>
                            <div className="text-sm text-[#d8c68f]">
                              Total: {formatMoney(client.total_spent)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
              {!selectedClient ? (
                <div className="text-sm text-[#d8c68f]">Seleccioná un cliente para ver el detalle.</div>
              ) : (
                <div className="grid gap-5">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-[#b9962f]">Ficha de cliente</div>
                    <h2 className="mt-2 text-2xl font-bold text-[#d4af37]">{selectedClient.customer_name}</h2>
                  </div>

                  <div className="grid gap-2 text-sm text-[#f5e7c2]">
                    <div><span className="text-[#d8c68f]">Teléfono:</span> {selectedClient.phone || "-"}</div>
                    <div><span className="text-[#d8c68f]">Instagram:</span> {selectedClient.instagram || "-"}</div>
                    <div><span className="text-[#d8c68f]">Ciudad:</span> {selectedClient.city || "-"}</div>
                    <div><span className="text-[#d8c68f]">Pedidos:</span> {selectedClient.orders_count}</div>
                    <div><span className="text-[#d8c68f]">Total gastado:</span> {formatMoney(selectedClient.total_spent)}</div>
                    <div><span className="text-[#d8c68f]">Última compra:</span> {formatDate(selectedClient.last_order_at)}</div>
                  </div>

                  <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                    <div className="mb-3 text-sm font-semibold text-[#d4af37]">Historial</div>
                    {selectedOrders.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">No hay compras registradas.</div>
                    ) : (
                      <div className="grid gap-3">
                        {selectedOrders.map((order) => (
                          <div
                            key={order.id}
                            className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[rgba(255,255,255,0.02)] p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium text-[#f5e7c2]">{order.order_number}</div>
                              <div className="text-sm text-[#d8c68f]">{formatMoney(order.total)}</div>
                            </div>
                            <div className="mt-1 text-sm text-[#d8c68f]">
                              {formatDate(order.created_at)} · Estado: {order.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                    <div className="mb-2 text-sm font-semibold text-[#d4af37]">Observaciones</div>
                    <p className="text-sm text-[#f5e7c2]">{selectedClient.notes || "Sin observaciones."}</p>
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
