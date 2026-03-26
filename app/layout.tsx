import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Decant Go",
  description: "Catálogo premium de decants",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_#1a1408_0%,_#0b0b0b_35%,_#050505_100%)] text-[#f5e7c2]">
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 border-b border-[rgba(212,175,55,0.16)] bg-[rgba(8,8,8,0.78)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[linear-gradient(135deg,rgba(212,175,55,.14),rgba(184,134,11,.08))]">
                  <Image src="/logo.png" alt="Decant Go" width={56} height={56} className="h-full w-full object-cover" priority />
                </div>
                <div>
                  <div className="text-xl font-extrabold tracking-[0.04em] text-[#d4af37]">Decant Go</div>
                  <div className="text-xs text-[#d9c78e]">Catálogo premium de decants</div>
                </div>
              </Link>

              <nav className="hidden items-center gap-2 md:flex">
                <Link href="/" className="rounded-full border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm">Inicio</Link>
                <Link href="/catalogo" className="rounded-full border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm">Catálogo</Link>
                <Link href="/como-comprar" className="rounded-full border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm">Cómo comprar</Link>
                <Link href="/envios" className="rounded-full border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm">Envíos</Link>
                <Link href="/faq" className="rounded-full border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm">FAQ</Link>
                <Link href="/socios/login" className="rounded-full bg-[linear-gradient(135deg,#d4af37_0%,#b8860b_100%)] px-4 py-2 text-sm font-bold text-black">Socios</Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <a
            href="https://wa.me/59895507692"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full border border-[#25D366]/30 bg-[#25D366] px-5 py-3 text-sm font-bold text-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:scale-[1.02]"
          >
            <span className="text-lg">💬</span>
            WhatsApp
          </a>

          <footer className="border-t border-[rgba(212,175,55,0.14)] bg-[rgba(8,8,8,0.72)]">
            <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-6 text-sm md:flex-row md:px-6">
              <div>
                <div className="font-bold text-[#d4af37]">Decant Go</div>
                <div className="text-[#c9b678]">Fragancias seleccionadas en formato decant.</div>
              </div>
              <div className="text-[#a9965b]">© {new Date().getFullYear()} Decant Go</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
