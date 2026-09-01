# Prova

Danışmanlık (McKinsey/BCG/Bain tarzı) case interview pratiği için sesli + yazılı AI mülakatçı platformu. Next.js + Supabase + OpenAI ile geliştirildi, Vercel'de yayınlanmak üzere hazırlandı.

## Özellikler

- E-posta/şifre ile kayıt ve giriş (Supabase Auth)
- AI tarafından üretilen case interview kütüphanesi
- Yazılı **veya** sesli (konuşarak) mülakat modu
- 4 aşamalı gerçekçi mülakat akışı: Açılış → Strateji → Analiz → Tavsiye
- Oturum sonunda otomatik puanlama ve geri bildirim raporu
- İlerleme takibi içeren panel (dashboard)
- Önceden doldurulmuş bir demo hesap
- SaaS abonelik modeli: ücretsiz deneme + iyzico ile Pro plan (Türkiye'de çalışır)

## Teknoloji

- **Frontend/Backend:** Next.js 16 (App Router), Tailwind CSS 4
- **Veritabanı & Auth:** Supabase (Postgres + Row Level Security)
- **AI:** OpenAI (`gpt-4o-mini` sohbet, `whisper-1` konuşma→metin, `tts-1` metin→konuşma)
- **Ödeme:** iyzico (Subscription Checkout Form)
- **Deploy:** Vercel

## Yerel kurulum

1. Bağımlılıkları yükle:
   ```bash
   npm install
   ```
2. `.env.example` dosyasını `.env.local` olarak kopyala ve değerleri doldur (Supabase Project Settings > API, > Database; OpenAI API key).
3. Veritabanı şemasını oluştur:
   ```bash
   npm run db:migrate
   ```
4. Örnek case'leri ve demo hesabı oluştur:
   ```bash
   npm run db:seed
   ```
   Script sonunda demo hesabın e-posta/şifresini terminalde göreceksin.
5. Geliştirme sunucusunu başlat:
   ```bash
   npm run dev
   ```

## Vercel'e deploy

1. Bu repoyu GitHub'a push et (`git push -u origin main`).
2. [vercel.com/new](https://vercel.com/new) üzerinden repoyu import et.
3. Environment Variables kısmına `.env.local` içindeki tüm değişkenleri ekle (`NEXT_PUBLIC_SITE_URL`'i Vercel'in verdiği gerçek adresle güncelle).
4. Deploy et. İlk deploy sonrası veritabanı migration ve seed'i yerelden (`.env.local`'da gerçek Supabase bilgileriyle) bir kere çalıştırman yeterli — Supabase projesi tüm ortamlarda paylaşılır.
5. Özel domain bağladıysan (örn. `prova.website`):
   - Vercel → Project Settings → Domains'ten domain'i ekle ve DNS kayıtlarını domain sağlayıcında ayarla.
   - Vercel → Project Settings → Environment Variables'ta `NEXT_PUBLIC_SITE_URL`'i `https://prova.website` yap ve **redeploy et** (env değişikliği yeni deploy'da devreye girer).
   - Supabase Dashboard → Authentication → URL Configuration: **Site URL**'i `https://prova.website` yap, **Redirect URLs**'e `https://prova.website/auth/callback` ekle — yoksa kayıt e-postasındaki onay linki ve iyzico ödeme sonrası yönlendirmesi çalışmaz.

## Veritabanı şeması

`supabase/migrations/` altında tanımlı:

- `profiles` — kullanıcı profili + abonelik durumu (`plan`, `current_period_end`); auth.users tetikleyicisiyle otomatik oluşur
- `cases` — case interview senaryoları
- `sessions` — bir kullanıcının bir case üzerindeki mülakat oturumu
- `messages` — oturum transkripti
- `feedback` — oturum sonu AI değerlendirmesi
- `payments` — iyzico ödeme geçmişi (denetim amaçlı)

Tüm tablolarda Row Level Security aktif; kullanıcılar yalnızca kendi verilerini görebilir/değiştirebilir. `npm run db:migrate` tekrar çalıştırıldığında sadece henüz uygulanmamış migration dosyalarını uygular (`public._migrations` tablosunda takip edilir).

## iyzico kurulumu

Stripe Türkiye merkezli işletmeleri desteklemediği için ödeme altyapısı olarak **iyzico** kullanılıyor (Subscription Checkout Form API).

1. [iyzico Merchant Panel](https://merchant.iyzipay.com) üzerinden bir hesap aç (sandbox test hesabı da mevcut: https://sandbox-merchant.iyzipay.com).
2. Ayarlar → API anahtarları'ndan `IYZICO_API_KEY` ve `IYZICO_SECRET_KEY`'i al, `.env.local`'a yaz (sandbox test için `IYZICO_URI=https://sandbox-api.iyzipay.com`, canlıda `https://api.iyzipay.com`).
3. Pro plan ürününü/fiyatını bir kere oluşturmak için:
   ```bash
   npm run iyzico:setup
   ```
   Script sonunda verdiği `IYZICO_PRICING_PLAN_REFERENCE_CODE` değerini `.env.local`'a ekle.
4. Ücretsiz plan `FREE_SESSION_LIMIT` (varsayılan 2, `src/lib/iyzico.ts`) kadar oturuma izin verir; sonrasında `/pricing` → `/checkout`'a yönlendirilir.
5. Ödeme akışı: `/checkout` sayfasında kullanıcı fatura bilgilerini (TC kimlik no, adres vb. — iyzico'nun zorunlu tuttuğu alanlar) girer → iyzico'nun güvenli checkout formu sayfada açılır → ödeme tamamlanınca iyzico `/api/iyzico/callback`'i çağırır, oradan abonelik doğrulanıp `profiles.plan`/`current_period_end` güncellenir.
6. Bu model **otomatik yenilemeli değil, manuel yenilemedir**: kullanıcı ayda bir tekrar `/checkout`'tan ödeme yapar. Tam otomatik tekrarlayan tahsilat için iyzico'nun kart saklama + `subscription` (recurring charge) uçlarının ayrıca entegre edilmesi gerekir.
