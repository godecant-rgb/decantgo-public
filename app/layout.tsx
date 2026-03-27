import "./globals.css";
import Image from "next/image";
import Link from "next/link";
<<<<<<< HEAD
import FragranceAssistant from "../components/FragranceAssistant";
=======
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3

export const metadata = {
  title: "Decant Go",
  description: "Catálogo premium de decants",
  icons: { icon: "/favicon.png" },
};

<<<<<<< HEAD
const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/como-comprar", label: "Cómo comprar" },
  { href: "/envios", label: "Envíos" },
  { href: "/faq", label: "FAQ" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#14110d] text-[#f4e7c3] antialiased">
        <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(223,190,86,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(200,146,25,0.08),transparent_28%),linear-gradient(180deg,#1a1510_0%,#16120e_38%,#14110d_100%)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.014)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.12]" />

          <div className="relative z-10 flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 border-b border-[rgba(223,190,86,0.14)] bg-[rgba(26,21,16,0.72)] backdrop-blur-xl">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
                <Link href="/" className="group flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[rgba(223,190,86,0.18)] bg-[linear-gradient(135deg,rgba(223,190,86,.16),rgba(200,146,25,.10))] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition group-hover:border-[rgba(223,190,86,0.28)]">
                    <Image
                      src="/logo.png"
                      alt="Decant Go"
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>

                  <div>
                    <div className="text-xl font-extrabold tracking-[0.08em] text-[#e7c96a] transition group-hover:text-[#f3d878]">
                      Decant Go
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-[#dcc894]">
                      Perfumes premium
                    </div>
                  </div>
                </Link>

                <nav className="hidden items-center gap-2 rounded-full border border-[rgba(223,190,86,0.10)] bg-[rgba(255,248,235,0.04)] px-2 py-2 md:flex">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-4 py-2 text-sm text-[#e2cf9b] transition hover:bg-[rgba(223,190,86,0.10)] hover:text-[#fff1c7]"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <Link
                    href="/socios/login"
                    className="ml-1 rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-4 py-2 text-sm font-bold text-black shadow-[0_8px_20px_rgba(223,190,86,0.16)] transition hover:scale-[1.02]"
                  >
                    Socios
                  </Link>
                </nav>
              </div>

              <div className="border-t border-[rgba(223,190,86,0.08)] px-4 py-3 md:hidden">
                <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="whitespace-nowrap rounded-full border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.04)] px-4 py-2 text-sm text-[#e2cf9b] transition hover:bg-[rgba(223,190,86,0.10)] hover:text-[#fff1c7]"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <Link
                    href="/socios/login"
                    className="whitespace-nowrap rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-4 py-2 text-sm font-bold text-black"
                  >
                    Socios
                  </Link>
                </div>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="mt-16 border-t border-[rgba(223,190,86,0.12)] bg-[rgba(26,21,16,0.62)]">
              <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-[1.2fr_0.9fr_0.9fr] md:px-6">
                <div>
                  <div className="text-lg font-semibold tracking-[0.10em] text-[#e7c96a]">
                    Decant Go
                  </div>
                  <p className="mt-4 max-w-md text-sm leading-7 text-[#dcc894]">
                    Fragancias seleccionadas en formato decant para descubrir perfumes
                    árabes y de diseñador con una experiencia más simple, cuidada y elegante.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#dfbe56]">
                    Navegación
                  </h3>
                  <div className="mt-4 flex flex-col gap-3 text-sm">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-[#e2cf9b] transition hover:text-[#fff1c7]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#dfbe56]">
                    Atención
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-[#e2cf9b]">
                    <p>Atención personalizada por WhatsApp</p>
                    <p>Envíos a todo Uruguay</p>
                    <p>Retiros coordinados</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[rgba(223,190,86,0.08)] px-4 py-5">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-[#b59a5d] md:flex-row md:items-center md:justify-between">
                  <p>© {new Date().getFullYear()} Decant Go. Todos los derechos reservados.</p>
                  <p>Perfumes premium en formato decant.</p>
                </div>
              </div>
            </footer>

            <a
              href="https://wa.me/59895507692"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full border border-[rgba(223,190,86,0.20)] bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-5 py-3 text-sm font-bold text-black shadow-[0_14px_34px_rgba(223,190,86,0.20)] transition hover:scale-[1.03]"
            >
              <span className="text-lg">💬</span>
              WhatsApp
            </a>

            <FragranceAssistant />
          </div>
=======
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
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
        </div>
      </body>
    </html>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> cd795624ad4486ee904a3afcdd22490201e4f2b3
