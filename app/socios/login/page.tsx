"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SociosLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/socios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo iniciar sesión.");

      router.push("/socios");
      router.refresh();
    } catch (error: any) {
      setErrorMessage(error?.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 text-[#f4e7c3] md:px-6 md:py-10">
      <div className="mx-auto max-w-md">
        <section className="relative overflow-hidden rounded-[30px] border border-[rgba(223,190,86,0.18)] bg-[linear-gradient(135deg,#1f1812_0%,#271d12_55%,#18130f_100%)] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,190,86,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(200,146,25,0.10),transparent_26%)]" />
          <div className="relative">
            <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-[#bfa66a]">Acceso privado</p>
            <h1 className="text-3xl font-bold text-[#f4e7c3]">Ingreso de socios</h1>
            <p className="mt-3 text-sm leading-7 text-[#e2cf9b]">Iniciá sesión para acceder al panel de gestión, compras y analytics.</p>

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#e2cf9b]">Usuario</span>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="input-premium" placeholder="Usuario" autoComplete="username" required />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#e2cf9b]">Contraseña</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-premium" placeholder="Contraseña" autoComplete="current-password" required />
              </label>

              <button type="submit" disabled={loading} className="mt-2 rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-6 py-3 text-sm font-bold text-black shadow-[0_12px_28px_rgba(223,190,86,0.16)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
