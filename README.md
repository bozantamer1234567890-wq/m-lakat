# m-lakat — MülakatAI

Danışmanlık (McKinsey/BCG/Bain tarzı) case interview pratiği için sesli + yazılı AI mülakatçı platformu. Next.js + Supabase + OpenAI ile geliştirildi, Vercel'de yayınlanmak üzere hazırlandı.

## Özellikler

- E-posta/şifre ile kayıt ve giriş (Supabase Auth)
- AI tarafından üretilen case interview kütüphanesi
- Yazılı **veya** sesli (konuşarak) mülakat modu
- 4 aşamalı gerçekçi mülakat akışı: Açılış → Strateji → Analiz → Tavsiye
- Oturum sonunda otomatik puanlama ve geri bildirim raporu
- İlerleme takibi içeren panel (dashboard)
- Önceden doldurulmuş bir demo hesap

## Teknoloji

- **Frontend/Backend:** Next.js 16 (App Router), Tailwind CSS 4
- **Veritabanı & Auth:** Supabase (Postgres + Row Level Security)
- **AI:** OpenAI (`gpt-4o-mini` sohbet, `whisper-1` konuşma→metin, `tts-1` metin→konuşma)
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

## Veritabanı şeması

`supabase/migrations/0001_init.sql` dosyasında tanımlı:

- `profiles` — kullanıcı profili (auth.users tetikleyicisiyle otomatik oluşur)
- `cases` — case interview senaryoları
- `sessions` — bir kullanıcının bir case üzerindeki mülakat oturumu
- `messages` — oturum transkripti
- `feedback` — oturum sonu AI değerlendirmesi

Tüm tablolarda Row Level Security aktif; kullanıcılar yalnızca kendi verilerini görebilir/değiştirebilir.
