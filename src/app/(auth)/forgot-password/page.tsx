import { requestPasswordReset } from "@/app/(auth)/actions";
import { Button, Card, LinkButton } from "@/components/ui";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ info?: string }>;
}) {
  const { info } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <Card>
        <h1 className="mb-1 text-xl font-semibold text-brand-900">Şifremi unuttum</h1>
        <p className="mb-6 text-sm text-brand-600">
          E-posta adresini gir, sana bir şifre sıfırlama linki gönderelim.
        </p>

        {info && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{info}</p>
        )}

        <form action={requestPasswordReset} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            E-posta
            <input
              name="email"
              type="email"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <Button type="submit" className="mt-2 w-full">
            Sıfırlama linki gönder
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-600">
          <LinkButton href="/login" variant="ghost" className="!p-0 !inline">
            Giriş sayfasına dön
          </LinkButton>
        </p>
      </Card>
    </div>
  );
}
