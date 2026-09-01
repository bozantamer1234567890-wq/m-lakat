import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Şartları — Prova",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-brand-900">Kullanım Şartları</h1>
      <p className="mt-2 text-sm text-brand-500">Son güncelleme: {new Date().toLocaleDateString("tr-TR")}</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-brand-700">
        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">1. Hizmet</h2>
          <p>
            Prova, yapay zeka destekli case interview pratiği sunan bir platformdur. Sesli veya yazılı
            mülakat simülasyonları, otomatik geri bildirim ve ilerleme takibi sağlar. Prova bir
            danışmanlık firması değildir ve gerçek bir işe alım sürecinin parçası değildir; sunulan
            geri bildirim ve skorlar yapay zeka tarafından üretilir, kesin bir değerlendirme garantisi
            teşkil etmez.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">2. Hesap</h2>
          <p>
            Hesabını oluştururken doğru bilgi vermekle ve hesabının güvenliğinden (şifre gizliliği
            dahil) sorumlusun. 18 yaşından küçüklerin ebeveyn/vasi izniyle kullanması gerekir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">3. Abonelik ve ödeme</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Ücretsiz plan sınırlı sayıda mülakat oturumu içerir. Pro ve Coach planları ücretlidir ve
              aylık veya yıllık faturalandırılır.
            </li>
            <li>Ödemeler iyzico altyapısı üzerinden güvenli şekilde işlenir.</li>
            <li>
              Abonelik otomatik yenilenmez; her dönem sonunda tekrar ödeme yapman gerekir. İstediğin
              zaman yeni bir dönem için ödeme yapmayarak aboneliğini sona erdirebilirsin.
            </li>
            <li>
              Ödemeler, ilgili mevzuat kapsamındaki yasal hakların saklı kalması kaydıyla, genel
              olarak iade edilmez; bir sorun yaşarsan bize ulaş, değerlendirelim.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">4. Kabul edilebilir kullanım</h2>
          <p>
            Platformu yalnızca kişisel mülakat hazırlığı amacıyla kullanabilirsin. Hesabını başkasına
            devretmek, hizmeti tersine mühendislikle kopyalamak, otomatik araçlarla kötüye kullanmak
            veya yasa dışı içerik üretmek için kullanmak yasaktır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">5. Fikri mülkiyet</h2>
          <p>
            Prova&apos;nın markası, tasarımı ve case kütüphanesi bize aittir. Mülakat sırasında ürettiğin
            cevaplar sana aittir; bunları AI değerlendirmesi üretmek amacıyla işlememize izin verirsin.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">6. Sorumluluk sınırı</h2>
          <p>
            Prova &ldquo;olduğu gibi&rdquo; sunulur. AI tarafından üretilen geri bildirim ve skorlar
            gerçek bir mülakat sonucunu garanti etmez. Platformun kullanımından doğabilecek dolaylı
            zararlardan yasaların izin verdiği azami ölçüde sorumlu değiliz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-brand-900">7. Değişiklikler</h2>
          <p>
            Bu şartları zaman zaman güncelleyebiliriz; önemli değişikliklerde seni bilgilendiririz.
            Hizmeti kullanmaya devam etmen güncellenmiş şartları kabul ettiğin anlamına gelir.
          </p>
        </section>
      </div>
    </div>
  );
}
