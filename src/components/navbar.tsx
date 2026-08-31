import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui";
import { signOut } from "@/app/(auth)/actions";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-brand-800">
          Mülakat<span className="text-brand-500">AI</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="px-3 py-2 text-brand-700 hover:text-brand-900">
                Panel
              </Link>
              <Link href="/cases" className="px-3 py-2 text-brand-700 hover:text-brand-900">
                Case'ler
              </Link>
              <form action={signOut}>
                <button className="px-3 py-2 text-brand-700 hover:text-brand-900">
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
                Ücretsiz başla
              </LinkButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
