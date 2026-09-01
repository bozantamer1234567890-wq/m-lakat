"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LinkButton } from "@/components/ui";
import { Logo } from "@/components/logo";

const NAV_LINKS = [
  { href: "/cases", label: "Pratik" },
  { href: "/cases", label: "Case'ler" },
  { href: "/#nasil-calisir", label: "Nasıl çalışır" },
  { href: "/pricing", label: "Fiyatlandırma" },
];

export function NavbarClient({
  authed,
  onSignOut,
}: {
  authed: boolean;
  onSignOut: () => Promise<void>;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-background"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="Prova anasayfa">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label + i}
              href={link.href}
              className="rounded-lg px-3 py-2 text-brand-700 transition-colors hover:text-brand-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authed ? (
            <>
              <LinkButton href="/dashboard" variant="ghost">
                Panel
              </LinkButton>
              <form action={onSignOut}>
                <button className="rounded-lg px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50">
                  Çıkış yap
                </button>
              </form>
            </>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost">
                Giriş yap
              </LinkButton>
              <LinkButton href="/signup" variant="primary">
                Pratiğe başla →
              </LinkButton>
            </>
          )}
        </div>

        <button
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-900 md:hidden"
        >
          <span className="relative block h-3.5 w-4">
            <span
              className={`absolute left-0 top-0 h-[1.5px] w-4 bg-current transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 top-[6px] h-[1.5px] w-4 bg-current transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute left-0 top-[12px] h-[1.5px] w-4 bg-current transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.label + i}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-brand-700 hover:bg-brand-50 hover:text-brand-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            {authed ? (
              <>
                <LinkButton href="/dashboard" variant="secondary" className="w-full">
                  Panel
                </LinkButton>
                <form action={onSignOut}>
                  <button className="w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-brand-700 hover:bg-brand-50">
                    Çıkış yap
                  </button>
                </form>
              </>
            ) : (
              <>
                <LinkButton href="/login" variant="secondary" className="w-full">
                  Giriş yap
                </LinkButton>
                <LinkButton href="/signup" variant="primary" className="w-full">
                  Pratiğe başla →
                </LinkButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
