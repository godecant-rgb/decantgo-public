"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../src/lib/supabase/client";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  total: number | null;
  created_at: string;
};

type ExpenseRow = {
  id: string;
  concept: string;
  amount: number;
  partner: string | null;
  expense_date: string;
  notes: string | null;
  status: string | null;
  paid_by: string | null;
  created_at: string;
};

function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toFixed(0)}`;
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Sin fecha";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function inputDateValue(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const STATUS_OPTIONS = ["pendiente", "pagado", "cerrado"];
const PAID_BY_OPTIONS = ["General", "Leo", "Luis", "Ambos"];

export default function SociosFinanzasPage() {
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingExpense, setSavingExpense] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [partner, setPartner] = useState("General");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pendiente");
  const [paidBy, setPaidBy] = useState("General");
  const [showClosed, setShowClosed] = useState(false);

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

      const [ordersRes, expensesRes] = await Promise.all([
        supabase.from("public_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("partner_expenses").select("*").order("expense_date", { ascending: false }).order("created_at", { ascending: false }),
      ]);

      if (ordersRes.error) console.error("FINANZAS ORDERS ERROR:", ordersRes.error);
      if (expensesRes.error) console.error("FINANZAS EXPENSES ERROR:", expensesRes.error);

      setOrders((ordersRes.data ?? []) as OrderRow[]);
      setExpenses((expensesRes.data ?? []) as ExpenseRow[]);
      setLoading(false);
    }

    loadData();
  }, [authorized]);

  function resetForm() {
    setEditingId(null);
    setConcept("");
    setAmount("");
    setPartner("General");
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setStatus("pendiente");
    setPaidBy("General");
  }

  async function submitExpense(e: React.FormEvent) {
    e.preventDefault();

    if (!concept.trim()) {
      alert("Ingresá el concepto del gasto.");
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert("Ingresá un monto válido.");
      return;
    }

    setSavingExpense(true);
    const supabase = createClient();

    const payload = {
      concept: concept.trim(),
      amount: numericAmount,
      partner,
      expense_date: expenseDate || new Date().toISOString().slice(0, 10),
      notes: notes.trim() || null,
      status,
      paid_by: paidBy,
    };

    let error = null;

    if (editingId) {
      const res = await supabase.from("partner_expenses").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("partner_expenses").insert(payload);
      error = res.error;
    }

    if (error) {
      console.error("SAVE EXPENSE ERROR:", error);
      alert("No se pudo guardar el gasto.");
      setSavingExpense(false);
      return;
    }

    resetForm();
    window.location.reload();
  }

  function editExpense(exp: ExpenseRow) {
    setEditingId(exp.id);
    setConcept(exp.concept || "");
    setAmount(String(exp.amount ?? ""));
    setPartner(exp.partner || "General");
    setExpenseDate(inputDateValue(exp.expense_date || exp.created_at));
    setNotes(exp.notes || "");
    setStatus(exp.status || "pendiente");
    setPaidBy(exp.paid_by || "General");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function quickCloseExpense(exp: ExpenseRow, who: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("partner_expenses")
      .update({ status: "cerrado", paid_by: who })
      .eq("id", exp.id);

    if (error) {
      console.error("CLOSE EXPENSE ERROR:", error);
      alert("No se pudo cerrar el gasto.");
      return;
    }

    setExpenses((prev) => prev.map((g) => (g.id === exp.id ? { ...g, status: "cerrado", paid_by: who } : g)));
  }

  async function deleteExpense(id: string) {
    const ok = window.confirm("¿Eliminar este gasto?");
    if (!ok) return;

    const supabase = createClient();
    const { error } = await supabase.from("partner_expenses").delete().eq("id", id);

    if (error) {
      console.error("DELETE EXPENSE ERROR:", error);
      alert("No se pudo eliminar el gasto.");
      return;
    }

    setExpenses((prev) => prev.filter((g) => g.id !== id));
    if (editingId === id) resetForm();
  }

  const visibleExpenses = useMemo(() => {
    return expenses.filter((g) => (showClosed ? true : (g.status || "pendiente") !== "cerrado"));
  }, [expenses, showClosed]);

  const metrics = useMemo(() => {
    const grossSales = orders.reduce((acc, o) => acc + Number(o.total ?? 0), 0);

    const paidLike = orders.filter((o) =>
      ["pagado", "preparando", "enviado", "entregado"].includes((o.status || "").toLowerCase())
    );
    const paidSales = paidLike.reduce((acc, o) => acc + Number(o.total ?? 0), 0);

    const pendingAmount = orders.filter((o) => (o.status || "").toLowerCase() === "pendiente").reduce((acc, o) => acc + Number(o.total ?? 0), 0);
    const cancelledAmount = orders.filter((o) => (o.status || "").toLowerCase() === "cancelado").reduce((acc, o) => acc + Number(o.total ?? 0), 0);
    const deliveredAmount = orders.filter((o) => (o.status || "").toLowerCase() === "entregado").reduce((acc, o) => acc + Number(o.total ?? 0), 0);

    const activeExpenses = expenses.filter((g) => (g.status || "pendiente") !== "cerrado");
    const totalExpenses = activeExpenses.reduce((acc, g) => acc + Number(g.amount ?? 0), 0);
    const closedTotal = expenses.filter((g) => (g.status || "") === "cerrado").reduce((acc, g) => acc + Number(g.amount ?? 0), 0);

    const netAfterExpenses = paidSales - totalExpenses;

    const leoExpenses = activeExpenses.filter((g) => (g.partner || "").toLowerCase() === "leo").reduce((acc, g) => acc + Number(g.amount ?? 0), 0);
    const luisExpenses = activeExpenses.filter((g) => (g.partner || "").toLowerCase() === "luis").reduce((acc, g) => acc + Number(g.amount ?? 0), 0);
    const generalExpenses = activeExpenses.filter((g) => {
      const p = (g.partner || "").toLowerCase();
      return p !== "leo" && p !== "luis";
    }).reduce((acc, g) => acc + Number(g.amount ?? 0), 0);

    return {
      grossSales,
      paidSales,
      pendingAmount,
      cancelledAmount,
      deliveredAmount,
      totalExpenses,
      closedTotal,
      netAfterExpenses,
      leoExpenses,
      luisExpenses,
      generalExpenses,
      leoTheoretical: netAfterExpenses / 2,
      luisTheoretical: netAfterExpenses / 2,
    };
  }, [orders, expenses]);

  const monthly = useMemo(() => {
    const map = new Map<string, { key: string; sales: number; expenses: number; net: number }>();

    for (const order of orders) {
      const key = monthKey(order.created_at);
      const existing = map.get(key) || { key, sales: 0, expenses: 0, net: 0 };
      existing.sales += Number(order.total ?? 0);
      map.set(key, existing);
    }

    for (const exp of expenses.filter((g) => (g.status || "pendiente") !== "cerrado")) {
      const key = monthKey(exp.expense_date || exp.created_at);
      const existing = map.get(key) || { key, sales: 0, expenses: 0, net: 0 };
      existing.expenses += Number(exp.amount ?? 0);
      map.set(key, existing);
    }

    return Array.from(map.values()).map((m) => ({ ...m, net: m.sales - m.expenses })).sort((a, b) => b.key.localeCompare(a.key));
  }, [orders, expenses]);

  if (!authorized) return null;

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.92)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#b9962f]">Panel privado</p>
              <h1 className="mt-2 text-4xl font-bold text-[#d4af37]">Finanzas</h1>
              <p className="mt-2 text-sm text-[#d8c68f]">Resumen financiero con gastos editables y cierre de saldos.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/socios/dashboard" className="rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm">Volver</Link>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 text-sm text-[#d8c68f]">Cargando finanzas...</div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Ventas brutas", formatMoney(metrics.grossSales)],
                  ["Ventas cobrables", formatMoney(metrics.paidSales)],
                  ["Gastos activos", formatMoney(metrics.totalExpenses)],
                  ["Gastos cerrados", formatMoney(metrics.closedTotal)],
                  ["Utilidad neta", formatMoney(metrics.netAfterExpenses)],
                  ["Pendiente por cobrar", formatMoney(metrics.pendingAmount)],
                  ["Cancelado", formatMoney(metrics.cancelledAmount)],
                  ["Entregado", formatMoney(metrics.deliveredAmount)],
                ].map(([title, value]) => (
                  <div key={title} className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                    <div className="text-sm text-[#d8c68f]">{title}</div>
                    <div className="mt-2 text-3xl font-bold text-[#d4af37]">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-[#d4af37]">{editingId ? "Editar gasto" : "Cargar gasto"}</h2>
                    {editingId ? (
                      <button onClick={resetForm} className="rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm">
                        Cancelar edición
                      </button>
                    ) : null}
                  </div>

                  <form onSubmit={submitExpense} className="mt-4 grid gap-3">
                    <input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Concepto del gasto" className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]" />
                    <div className="grid gap-3 md:grid-cols-3">
                      <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto" className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]" />
                      <select value={partner} onChange={(e) => setPartner(e.target.value)} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]">
                        <option value="General">General</option>
                        <option value="Leo">Leo</option>
                        <option value="Luis">Luis</option>
                      </select>
                      <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]">
                        {PAID_BY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" rows={3} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]" />
                    <button type="submit" disabled={savingExpense} className="rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-4 font-bold text-black">
                      {savingExpense ? "Guardando..." : editingId ? "Guardar cambios" : "Guardar gasto"}
                    </button>
                  </form>
                </div>

                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Reparto teórico</h2>
                  <p className="mt-2 text-sm text-[#d8c68f]">Utilidad neta = ventas cobrables - gastos activos. Los gastos cerrados salen de la vista principal.</p>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                      <div className="text-sm text-[#d8c68f]">Parte Leo</div>
                      <div className="mt-1 text-3xl font-bold text-[#d4af37]">{formatMoney(metrics.leoTheoretical)}</div>
                      <div className="mt-1 text-xs text-[#bfae73]">Gastos Leo: {formatMoney(metrics.leoExpenses)}</div>
                    </div>

                    <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                      <div className="text-sm text-[#d8c68f]">Parte Luis</div>
                      <div className="mt-1 text-3xl font-bold text-[#d4af37]">{formatMoney(metrics.luisTheoretical)}</div>
                      <div className="mt-1 text-xs text-[#bfae73]">Gastos Luis: {formatMoney(metrics.luisExpenses)}</div>
                    </div>

                    <div className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                      <div className="text-sm text-[#d8c68f]">Gastos generales</div>
                      <div className="mt-1 text-2xl font-bold text-[#d4af37]">{formatMoney(metrics.generalExpenses)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <h2 className="text-2xl font-bold text-[#d4af37]">Resumen mensual</h2>
                  <div className="mt-4 grid gap-3">
                    {monthly.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">Sin datos mensuales todavía.</div>
                    ) : (
                      monthly.map((m) => (
                        <div key={m.key} className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div><div className="font-medium text-[#f5e7c2]">{m.key}</div></div>
                            <div className="text-right">
                              <div className="text-sm text-[#d8c68f]">Ventas: {formatMoney(m.sales)}</div>
                              <div className="text-sm text-[#d8c68f]">Gastos: {formatMoney(m.expenses)}</div>
                              <div className="text-sm font-semibold text-[#d4af37]">Neto: {formatMoney(m.net)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-[#d4af37]">Gastos</h2>
                    <label className="flex items-center gap-2 text-sm text-[#d8c68f]">
                      <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
                      Ver cerrados
                    </label>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {visibleExpenses.length === 0 ? (
                      <div className="text-sm text-[#d8c68f]">No hay gastos para mostrar.</div>
                    ) : (
                      visibleExpenses.map((g) => (
                        <div key={g.id} className="rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[rgba(0,0,0,0.18)] p-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <div className="font-medium text-[#f5e7c2]">{g.concept}</div>
                                <div className="text-sm text-[#d8c68f]">
                                  {g.partner || "General"} · {inputDateValue(g.expense_date)} · {g.status || "pendiente"}
                                </div>
                                <div className="mt-1 text-xs text-[#bfae73]">
                                  Pagado por: {g.paid_by || "General"} · {g.notes || "Sin notas"}
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-[#d4af37]">{formatMoney(g.amount)}</div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-4">
                              <button onClick={() => editExpense(g)} className="rounded-lg border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-medium text-[#f5e7c2]">Editar</button>
                              <button onClick={() => quickCloseExpense(g, "Leo")} className="rounded-lg border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-medium text-[#f5e7c2]">Cerró Leo</button>
                              <button onClick={() => quickCloseExpense(g, "Luis")} className="rounded-lg border border-[rgba(212,175,55,0.16)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-medium text-[#f5e7c2]">Cerró Luis</button>
                              <button onClick={() => quickCloseExpense(g, "Ambos")} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">Cerrado ambos</button>
                            </div>

                            <div className="flex justify-end">
                              <button onClick={() => deleteExpense(g.id)} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">
                                Eliminar
                              </button>
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
