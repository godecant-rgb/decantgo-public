"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SociosLoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const leoPass = process.env.NEXT_PUBLIC_LEO_PASSWORD || "1111";
    const luisPass = process.env.NEXT_PUBLIC_LUIS_PASSWORD || "2222";
    const ok = (user === "Leo" && pass === leoPass) || (user === "Luis" && pass === luisPass);
    if (!ok) {
      alert("Usuario o contraseña incorrectos.");
      return;
    }
    localStorage.setItem("dg_socios_auth", "ok");
    localStorage.setItem("dg_socios_user", user);
    router.push("/socios/dashboard");
  }

  return (
    <main className="px-4 py-10 md:px-6">
      <div className="mx-auto max-w-xl">
        <section className="rounded-[28px] border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.92)] p-8 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#b9962f]">Área privada</p>
          <h1 className="text-4xl font-bold text-[#d4af37]">Login socios</h1>
          <p className="mt-3 text-sm text-[#d8c68f]">Acceso privado para gestión de pedidos, clientes y finanzas.</p>
          <form onSubmit={handleLogin} className="mt-8 grid gap-4">
            <select value={user} onChange={(e) => setUser(e.target.value)} className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none focus:border-[#d4af37]">
              <option value="">Seleccioná usuario</option>
              <option value="Leo">Leo</option>
              <option value="Luis">Luis</option>
            </select>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Contraseña" className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-[#9f8f5e] focus:border-[#d4af37]" />
            <button type="submit" className="rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-5 py-4 font-bold text-black">Ingresar</button>
          </form>
        </section>
      </div>
    </main>
  );
}
