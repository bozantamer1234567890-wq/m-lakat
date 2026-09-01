import { updatePassword } from "@/app/(auth)/actions";
import { Button, Card } from "@/components/ui";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <Card>
        <h1 className="mb-1 text-xl font-semibold text-brand-900">Yeni şifre belirle</h1>
        <p className="mb-6 text-sm text-brand-600">Hesabın için yeni bir şifre gir.</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <form action={updatePassword} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Yeni şifre
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <Button type="submit" className="mt-2 w-full">
            Şifreyi güncelle
          </Button>
        </form>
      </Card>
    </div>
  );
}
