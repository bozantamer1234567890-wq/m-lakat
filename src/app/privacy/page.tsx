import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Prova",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-brand-900">Gizlilik Politikası</h1>
      <p className="mt-2 text-sm text-brand-500">Son güncelleme: {new Date().toLocaleDateString("tr-TR")}</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-brand-700">
        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">1. Hangi verileri topluyoruz</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hesap bilgileri: ad soyad, e-posta adresi (Supabase üzerinden kimlik doğrulama).</li>
            <li>Profil tercihleri: hedef firma, mülakat tarihi, deneyim seviyesi, günlük pratik hedefi.</li>
            <li>
              Kullanım verisi: case interview oturumlarının yazılı transkripti, AI tarafından üretilen
              geri bildirim ve skorlar, ilerleme geçmişin.
            </li>
            <li>
              Sesli mülakat modu kullanıldığında ses, konuşmayı metne çevirmek (Whisper) ve mülakatçının
              sesini üretmek (TTS) için anlık olarak işlenir; ses kaydı sunucularımızda{" "}
              <strong>saklanmaz</strong>.
            </li>
            <li>
              Ödeme bilgileri (ad, TC kimlik no, adres, telefon) doğrudan ödeme sağlayıcımız iyzico&apos;ya
              iletilir; kart bilgilerin hiçbir zaman bizim sunucularımızdan geçmez veya bizde saklanmaz.
              Yalnızca işlem durumunu ve referans kodunu kaydederiz.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">2. Verileri neden topluyoruz</h2>
          <p>
            Toplanan veriler yalnızca hizmeti sağlamak (hesabını yönetmek, mülakat pratiğini
            gerçekleştirmek, geri bildirim üretmek, aboneliğini işletmek) ve deneyimini kişiselleştirmek
            (zayıf/güçlü becerilerine göre öneriler sunmak) amacıyla kullanılır. Verilerin satılması veya
            reklam amacıyla üçüncü taraflarla paylaşılması söz konusu değildir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">3. Verileri kimlerle paylaşıyoruz</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Supabase</strong> — veritabanı ve kimlik doğrulama altyapımız.
            </li>
            <li>
              <strong>OpenAI</strong> — mülakat metinlerinin işlenmesi, ses tanıma/üretimi ve geri
              bildirim üretimi için.
            </li>
            <li>
              <strong>iyzico</strong> — ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi için.
            </li>
            <li>
              <strong>Vercel</strong> — uygulamanın barındırılması için.
            </li>
          </ul>
          <p className="mt-2">
            Bu sağlayıcılar verilerini yalnızca hizmeti sağlamak amacıyla, kendi gizlilik politikaları
            çerçevesinde işler.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">4. Haklarının (KVKK)</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; verilerinin işlenip
            işlenmediğini öğrenme, işlenmişse bilgi talep etme, eksik/yanlış verilerin düzeltilmesini
            isteme ve verilerinin silinmesini/yok edilmesini talep etme hakkına sahipsin. Bu talepleri
            hesabından veya bize ulaşarak iletebilirsin.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">5. Veri saklama ve silme</h2>
          <p>
            Verilerini, hesabın aktif olduğu sürece ve yasal yükümlülüklerimizin gerektirdiği süre
            boyunca saklarız. Hesabının silinmesini talep edersen, ilişkili verilerin (mülakat
            geçmişi, geri bildirimler, profil bilgileri) makul bir süre içinde silinir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">6. Çerezler</h2>
          <p>
            Prova, oturumunu açık tutmak için yalnızca zorunlu kimlik doğrulama çerezlerini kullanır.
            Reklam veya izleme amaçlı üçüncü taraf çerezi kullanmıyoruz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">7. İletişim</h2>
          <p>
            Gizlilikle ilgili sorularını veya veri talebini, hesabına kayıtlı e-posta adresi üzerinden
            bize iletebilirsin.
          </p>
        </section>
      </div>
    </div>
  );
}
