import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";
import { CheckoutForm } from "@/app/checkout/checkout-form";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <Badge>Prova Pro</Badge>
      <h1 className="mt-3 text-2xl font-semibold text-brand-900">Aboneliğini tamamla</h1>
      <p className="mt-2 text-sm text-brand-600">
        Ödeme bilgilerini iyzico&apos;nun güvenli formu üzerinden gireceksin. Kart bilgilerin bizden geçmez.
      </p>
      <div className="mt-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
