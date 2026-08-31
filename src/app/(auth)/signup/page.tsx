import { signUp } from "@/app/(auth)/actions";
import { Button, Card, LinkButton } from "@/components/ui";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <Card>
        <h1 className="mb-1 text-xl font-semibold text-brand-900">Ücretsiz başla</h1>
        <p className="mb-6 text-sm text-brand-600">
          Birkaç dakikada ilk case interview'ini deneyimle.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <form action={signUp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Ad Soyad
            <input
              name="full_name"
              type="text"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            E-posta
            <input
              name="email"
              type="email"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Şifre
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <Button type="submit" className="mt-2 w-full">
            Hesap oluştur
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-600">
          Zaten hesabın var mı?{" "}
          <LinkButton href="/login" variant="ghost" className="!p-0 !inline">
            Giriş yap
          </LinkButton>
        </p>
      </Card>
    </div>
  );
}
