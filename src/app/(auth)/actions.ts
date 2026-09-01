"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-posta veya şifre hatalı.",
  "Email not confirmed":
    "E-posta adresini henüz onaylamadın. Gelen kutunu (spam klasörü dahil) kontrol edip onay linkine tıkla.",
  "User already registered": "Bu e-posta ile zaten bir hesap var, giriş yapmayı dene.",
  "Password should be at least 6 characters.": "Şifre en az 6 karakter olmalı.",
  "New password should be different from the old password.":
    "Yeni şifre eskisinden farklı olmalı.",
  "Auth session missing!": "Oturum bulunamadı, linki tekrar iste.",
  "Error sending confirmation email":
    "Onay e-postası gönderilemedi. Bu genelde e-posta gönderim ayarlarımızdaki geçici bir sorundan kaynaklanır, lütfen daha sonra tekrar dene.",
};

function translateAuthError(message: string) {
  return AUTH_ERROR_MESSAGES[message] ?? message;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(translateAuthError(error.message))}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(translateAuthError(error.message))}`);
  }

  if (!data.session) {
    redirect(
      `/login?info=${encodeURIComponent(
        "Hesabın oluşturuldu! E-postana gelen onay linkine tıkladıktan sonra giriş yapabilirsin."
      )}`
    );
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  // Kullanıcı hesabın olup olmadığını bu mesajdan anlayamasın diye her zaman aynı bilgi mesajını gösteriyoruz.
  redirect(
    `/forgot-password?info=${encodeURIComponent(
      "Bu e-posta ile kayıtlı bir hesap varsa, şifre sıfırlama linki gönderildi."
    )}`
  );
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(translateAuthError(error.message))}`);
  }

  redirect(
    `/login?info=${encodeURIComponent("Şifren güncellendi, yeni şifrenle giriş yapabilirsin.")}`
  );
}
