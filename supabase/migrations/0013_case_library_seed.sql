-- Case Library seed: 24 curated case interview scenarios spanning 8
-- categories and 12 industries, each tagged with skill metadata for the
-- recommendation engine and a min_plan for Free/Pro gating. Idempotent via
-- the 'case-library-v1' marker tag.

insert into public.cases (
  title, subtitle, industry, difficulty, category, estimated_minutes,
  summary, prompt, skills, tags, is_featured, is_new, min_plan,
  is_published, is_diagnostic, is_drill
)
select * from (values
  -- KARLILIK (4)
  ('Perakende Zincirinde Kâr Erozyonu', 'Kârlılık düşüşünün kaynağını bul', 'Retail', 'easy', 'karlilik', 25,
   'Orta ölçekli bir perakende zincirinin son 2 yıldır düşen kârlılığının kaynağını analiz et ve somut bir aksiyon planı öner.',
   'Müvekkilimiz, Türkiye genelinde 85 şubesi olan bir giyim perakende zinciri. Toplam gelir sabit kalmasına rağmen net kâr marjı son 2 yılda %14''ten %9''a geriledi. Adaydan, kâr düşüşünün gelir mi yoksa maliyet kaynaklı mı olduğunu, hangi şube segmentinden geldiğini yapılandırılmış bir şekilde araştırmasını ve kârlılığı toparlayacak somut bir aksiyon planı sunmasını bekliyoruz.',
   ARRAY['structuring','quantitative'], ARRAY['retail','profitability','case-library-v1'], true, false, 'free', true, false, false),

  ('Bankada Şube Kârlılığı Analizi', 'Hangi şubeler zarar ediyor?', 'Banking', 'medium', 'karlilik', 28,
   'Bir bankanın şube ağındaki kârlılık farklarını analiz et ve zarar eden şubeler için strateji öner.',
   'Müvekkilimiz, 200''den fazla şubesi olan orta ölçekli bir ticari banka. Genel Müdürlük, şubelerin üçte birinin son yıl zarar ettiğini fark etti ancak nedenini bilmiyor. Adaydan, şube kârlılığını etkileyen faktörleri (işlem hacmi, personel maliyeti, kira, dijital kullanım oranı) yapılandırılmış biçimde incelemesini ve zarar eden şubeler için kapatma/dönüştürme/optimize etme seçeneklerini değerlendiren bir tavsiye sunmasını istiyoruz.',
   ARRAY['quantitative','business_judgment'], ARRAY['banking','profitability','case-library-v1'], false, false, 'pro', true, false, false),

  ('Gıda Üreticisinde Marj Baskısı', 'Hammadde maliyeti kârlılığı nasıl eziyor?', 'Food', 'medium', 'karlilik', 27,
   'Bir gıda üreticisinin artan hammadde maliyetleri karşısında kârlılığını nasıl koruyacağını analiz et.',
   'Müvekkilimiz, süt ürünleri üreten ulusal bir gıda şirketi. Son 18 ayda hammadde (çiğ süt, ambalaj) maliyetleri %35 arttı ancak satış fiyatlarını aynı oranda artıramadılar; brüt marj 6 puan geriledi. Adaydan, maliyet artışının hangi ürün kategorilerinde en çok hissedildiğini yapılandırılmış şekilde incelemesini ve fiyatlandırma, tedarik veya ürün mixi üzerinden kârlılığı geri kazandıracak bir plan önermesini bekliyoruz.',
   ARRAY['structuring','quantitative'], ARRAY['food','profitability','case-library-v1'], false, false, 'pro', true, false, false),

  ('SaaS Şirketinde Bulut Altyapı Maliyeti Artışı', 'Büyüme kârlılığı mı yiyor?', 'SaaS', 'hard', 'karlilik', 38,
   'Hızlı büyüyen bir SaaS şirketinin bulut altyapı maliyetlerinin kârlılığı nasıl aşındırdığını analiz et.',
   'Müvekkilimiz, B2B proje yönetim yazılımı satan hızlı büyüyen bir SaaS şirketi. Müşteri sayısı yıllık %60 artarken, bulut altyapı (hosting, veri işleme) maliyetleri gelirden çok daha hızlı büyüyor ve brüt marj %78''den %61''e düştü. Adaydan, maliyet artışının müşteri segmentlerine göre dağılımını ve olası kök nedenleri (mimari, fiyatlandırma paketi, kullanım yoğunluğu) yapılandırılmış şekilde araştırmasını, ardından marjı toparlayacak somut önlemler önermesini istiyoruz.',
   ARRAY['quantitative','hypothesis'], ARRAY['saas','profitability','case-library-v1'], false, false, 'pro', true, false, false),

  -- PAZARA GIRISI (4)
  ('Otomotivde Elektrikli Araç Pazarına Giriş', 'Yeni segmente girmeli mi?', 'Automotive', 'medium', 'pazara-girisi', 32,
   'Geleneksel bir otomotiv üreticisinin elektrikli araç segmentine girip girmemesi gerektiğine karar ver.',
   'Müvekkilimiz, içten yanmalı motorlu araç üreten köklü bir otomotiv şirketi. Yönetim kurulu, elektrikli araç (EV) segmentine kendi markasıyla girmeyi değerlendiriyor. Adaydan pazar büyüklüğü ve büyüme hızı, rekabet yoğunluğu, gerekli yatırım (üretim hattı, batarya tedariki) ve mevcut marka gücünün EV segmentine taşınabilirliğini yapılandırılmış şekilde değerlendirerek gir/girme kararı ve gerekçesini istiyoruz.',
   ARRAY['structuring','business_judgment'], ARRAY['automotive','market-entry','case-library-v1'], false, false, 'pro', true, false, false),

  ('Enerji Şirketinin Güneş Enerjisi Pazarına Girişi', 'Yenilenebilir enerjide fırsat var mı?', 'Energy', 'medium', 'pazara-girisi', 30,
   'Geleneksel bir enerji şirketinin güneş enerjisi santralleri pazarına girip girmemesi gerektiğini değerlendir.',
   'Müvekkilimiz, elektrik dağıtımı yapan büyük bir enerji şirketi. Devlet teşvikleri sonrası güneş enerjisi santrali (GES) kurulum pazarına kendi yatırım kolu ile girmeyi düşünüyor. Adaydan pazarın büyüklüğünü ve büyüme potansiyelini tahmin etmesini, mevcut oyuncularla rekabet edebilme olasılığını ve gerekli sermaye/operasyonel yetkinlik açığını yapılandırılmış şekilde değerlendirmesini istiyoruz.',
   ARRAY['structuring','market_sizing'], ARRAY['energy','market-entry','case-library-v1'], false, true, 'pro', true, false, false),

  ('E-ticaret Şirketinin Yeni Ülkeye Açılması', 'Komşu pazara genişleme kararı', 'E-commerce', 'easy', 'pazara-girisi', 22,
   'Bir e-ticaret platformunun komşu bir ülkeye açılıp açılmaması gerektiğine karar ver.',
   'Müvekkilimiz, ev eşyası satan orta ölçekli bir e-ticaret platformu. Kendi ülkesinde pazar lideri konumunda ve komşu bir ülkeye açılmayı değerlendiriyor. Adaydan hedef pazarın büyüklüğünü, mevcut yerel/uluslararası rakipleri ve lojistik/gümrük engellerini yapılandırılmış bir çerçeveyle değerlendirerek net bir gir/girme tavsiyesi sunmasını bekliyoruz.',
   ARRAY['structuring','hypothesis'], ARRAY['e-commerce','market-entry','case-library-v1'], false, false, 'free', true, false, false),

  ('Telekom Operatöründe Yeni Bölgeye Genişleme', 'Kırsal bölgeye şebeke yatırımı mantıklı mı?', 'Telecom', 'hard', 'pazara-girisi', 40,
   'Bir telekom operatörünün az hizmet verilen bir bölgeye şebeke yatırımı yapıp yapmaması gerektiğini analiz et.',
   'Müvekkilimiz, ülkenin büyük şehirlerinde güçlü olan bir mobil telekom operatörü. Devlet, kırsal bölgelere şebeke yatırımı yapan operatörlere teşvik sunuyor ancak bu bölgelerde nüfus yoğunluğu düşük ve ARPU (kullanıcı başına gelir) potansiyeli belirsiz. Adaydan yatırım maliyetini, olası abone tabanını ve teşviklerle birlikte yatırımın geri dönüş süresini yapılandırılmış şekilde değerlendirerek bir yatırım kararı önermesini istiyoruz.',
   ARRAY['structuring','quantitative'], ARRAY['telecom','market-entry','case-library-v1'], false, false, 'pro', true, false, false),

  -- BUYUME (3)
  ('SaaS Şirketinde Müşteri Kaybını Azaltma', 'Churn büyümeyi nasıl frenliyor?', 'SaaS', 'medium', 'buyume', 28,
   'B2B SaaS şirketinin artan müşteri kaybını analiz et ve azaltma stratejisi geliştir.',
   'Müvekkilimiz, orta ölçekli bir B2B SaaS şirketi. Aylık müşteri kaybı (churn) oranı %2''den %6''ya çıktı ve bu durum net büyümeyi neredeyse durdurdu. Adaydan churn''ün hangi müşteri segmentinden (şirket büyüklüğü, sektör, kullanım yoğunluğu) ve hangi nedenlerden kaynaklandığını yapılandırılmış şekilde araştırmasını, ardından somut bir azaltma aksiyon planı sunmasını istiyoruz.',
   ARRAY['hypothesis','communication'], ARRAY['saas','growth','case-library-v1'], false, false, 'pro', true, false, false),

  ('FMCG Markasında Yeni Ürün Büyümesi', 'Yeni ürün lansmanı büyümeyi hızlandırır mı?', 'FMCG', 'easy', 'buyume', 20,
   'Bir FMCG markasının yeni ürün lansmanı ile büyümeyi hızlandırıp hızlandıramayacağını değerlendir.',
   'Müvekkilimiz, atıştırmalık gıda kategorisinde faaliyet gösteren bir FMCG markası. Ana ürün kategorisinde büyüme yavaşladı ve şirket, bitişik bir kategoride (örneğin sağlıklı atıştırmalıklar) yeni bir ürün hattı lansmanını değerlendiriyor. Adaydan hedef kategorinin çekiciliğini, marka uzantısının inandırıcılığını ve olası kannibalizasyon riskini yapılandırılmış şekilde değerlendirerek bir tavsiye sunmasını istiyoruz.',
   ARRAY['structuring','communication'], ARRAY['fmcg','growth','case-library-v1'], false, false, 'free', true, false, false),

  ('Lojistik Şirketinde Uluslararası Büyüme', 'Hangi pazara öncelik verilmeli?', 'Logistics', 'hard', 'buyume', 38,
   'Bir lojistik şirketinin hangi yeni ülkede büyüme önceliği vermesi gerektiğine karar ver.',
   'Müvekkilimiz, kargo ve depolama hizmeti veren bölgesel bir lojistik şirketi. Yurt içi pazarda doygunluğa yaklaştılar ve üç komşu ülkeden birine öncelikli olarak genişlemeyi planlıyorlar. Adaydan her pazarın büyüklüğünü, rekabet yapısını ve operasyonel giriş engellerini (gümrük, altyapı, işgücü) karşılaştırmalı olarak değerlendirmesini ve gerekçeli bir öncelik sıralaması sunmasını istiyoruz.',
   ARRAY['business_judgment','quantitative'], ARRAY['logistics','growth','case-library-v1'], false, false, 'pro', true, false, false),

  -- BIRLESME-SATIN-ALMA (3)
  ('İki Yemek Teslimat Platformunun Birleşmesi', 'Sinerji gerçek mi, risk mi büyük?', 'E-commerce', 'hard', 'birlesme-satin-alma', 42,
   'İki büyük yemek teslimat platformunun birleşmesinin değerini ve risklerini değerlendir.',
   'Müvekkilimiz, pazarın ikinci büyük yemek teslimat platformu; pazarın dördüncü büyük oyuncusunu satın almayı değerlendiriyor. Adaydan olası sinerjileri (kurye ağı, restoran portföyü, teknoloji), entegrasyon risklerini ve rekabet otoritesinin işlemi engelleme olasılığını yapılandırılmış şekilde değerlendirmesini ve net bir satın alma tavsiyesi sunmasını istiyoruz.',
   ARRAY['business_judgment','hypothesis'], ARRAY['e-commerce','m-and-a','case-library-v1'], true, false, 'pro', true, false, false),

  ('Bankanın Fintek Şirketini Satın Alması', 'Dijital yetkinlik satın almak mantıklı mı?', 'Banking', 'hard', 'birlesme-satin-alma', 40,
   'Bir bankanın küçük bir fintek şirketini satın alıp almaması gerektiğini değerlendir.',
   'Müvekkilimiz, dijital dönüşümde geride kalan geleneksel bir banka. Hızlı büyüyen, ödeme teknolojisi geliştiren küçük bir fintek girişimini satın alarak dijital yetkinlik kazanmayı planlıyor. Adaydan satın almanın stratejik mantığını, olası değerleme aralığını ve iki farklı kurum kültürünün entegrasyon riskini yapılandırılmış şekilde değerlendirerek bir tavsiye sunmasını istiyoruz.',
   ARRAY['business_judgment','quantitative'], ARRAY['banking','m-and-a','case-library-v1'], false, false, 'pro', true, false, false),

  ('Üretim Şirketinin Tedarikçisini Satın Alması', 'Dikey entegrasyon riske değer mi?', 'Manufacturing', 'medium', 'birlesme-satin-alma', 30,
   'Bir üretim şirketinin kritik bir tedarikçisini satın alıp almaması gerektiğine karar ver.',
   'Müvekkilimiz, otomotiv yan sanayiinde faaliyet gösteren bir üretim şirketi. Kritik bir hammaddeyi tedarik eden ana tedarikçisini satın alarak tedarik zincirini garanti altına almayı ve maliyet avantajı elde etmeyi değerlendiriyor. Adaydan bu dikey entegrasyonun maliyet ve risk dengesini, alternatif tedarikçilerin varlığını ve satın alma sonrası operasyonel karmaşıklığı yapılandırılmış şekilde değerlendirmesini istiyoruz.',
   ARRAY['business_judgment','structuring'], ARRAY['manufacturing','m-and-a','case-library-v1'], false, false, 'free', true, false, false),

  -- FIYATLANDIRMA (3)
  ('Telekom Operatöründe Tarife Fiyatlandırması', 'Doğru paket, doğru fiyat', 'Telecom', 'medium', 'fiyatlandirma', 28,
   'Bir telekom operatörünün yeni mobil veri tarifelerini nasıl fiyatlandırması gerektiğini belirle.',
   'Müvekkilimiz, orta ölçekli bir mobil telekom operatörü. Rakiplerinin agresif kampanyaları sonrası pazar payı kaybediyor ve tarife portföyünü yeniden fiyatlandırmayı planlıyor. Adaydan müşteri segmentlerine (düşük/orta/yüksek veri kullanımı) göre fiyat hassasiyetini ve rakip fiyatlamasını yapılandırılmış şekilde değerlendirmesini, ardından somut bir tarife/fiyatlandırma önerisi sunmasını istiyoruz.',
   ARRAY['quantitative','business_judgment'], ARRAY['telecom','pricing','case-library-v1'], false, false, 'free', true, false, false),

  ('Perakendede Sadakat Programı Fiyatlandırması', 'Ücretli üyelik büyümeyi destekler mi?', 'Retail', 'medium', 'fiyatlandirma', 27,
   'Bir perakende zincirinin ücretli sadakat programı fiyatlandırmasını belirle.',
   'Müvekkilimiz, ulusal bir süpermarket zinciri. Rakiplerinin ücretli sadakat programlarından ilham alarak kendi ücretli üyelik modelini (yıllık aidat karşılığı indirim ve ayrıcalıklar) başlatmayı planlıyor. Adaydan üyelik ücretinin hangi seviyede belirlenmesi gerektiğini, müşteri segmentlerinin ödeme isteğini ve programın genel kârlılığa etkisini yapılandırılmış şekilde değerlendirmesini istiyoruz.',
   ARRAY['quantitative','hypothesis'], ARRAY['retail','pricing','case-library-v1'], false, false, 'pro', true, false, false),

  ('Enerji Şirketinde Dinamik Fiyatlandırma', 'Saatlik fiyatlandırma kârlılığı artırır mı?', 'Energy', 'hard', 'fiyatlandirma', 36,
   'Bir enerji tedarikçisinin dinamik (saatlik) elektrik fiyatlandırmasına geçip geçmemesi gerektiğini değerlendir.',
   'Müvekkilimiz, hane ve küçük işletmelere elektrik satan bir enerji tedarikçi şirketi. Sabit tarife yerine talebe göre değişen saatlik dinamik fiyatlandırmaya geçmeyi değerlendiriyor. Adaydan bu modelin gelir ve marj üzerindeki etkisini, müşteri kabul riskini ve gerekli operasyonel/teknolojik altyapı yatırımını yapılandırılmış şekilde değerlendirmesini istiyoruz.',
   ARRAY['quantitative','structuring'], ARRAY['energy','pricing','case-library-v1'], false, true, 'pro', true, false, false),

  -- PAZAR-BUYUKLUGU (3)
  ('Sağlık Teknolojisi Pazarının Büyüklüğünü Tahmin Etme', 'Klasik bir market sizing egzersizi', 'Healthcare', 'easy', 'pazar-buyuklugu', 20,
   'Bir ülkedeki uzaktan hasta takibi (telehealth) pazarının büyüklüğünü tahmin et.',
   'Müvekkilimiz, uzaktan hasta takibi (telehealth) alanında yeni bir ürün geliştiren bir sağlık teknolojisi girişimi. Yatırımcılarına sunmadan önce hedef pazarın büyüklüğünü tahmin etmemizi istiyor. Adaydan, nüfus, kronik hastalık oranı ve dijital sağlık hizmeti benimseme oranı gibi mantıklı varsayımlar üzerinden adım adım bir pazar büyüklüğü (top-down veya bottom-up) hesaplaması yapmasını bekliyoruz.',
   ARRAY['market_sizing','quantitative'], ARRAY['healthcare','market-sizing','case-library-v1'], true, false, 'free', true, false, false),

  ('Otomotiv Yedek Parça Pazarının Büyüklüğü', 'Yan sanayi fırsatını ölç', 'Automotive', 'medium', 'pazar-buyuklugu', 25,
   'Bir ülkedeki orijinal olmayan (aftermarket) otomotiv yedek parça pazarının büyüklüğünü tahmin et.',
   'Müvekkilimiz, otomotiv yedek parça üretimine girmeyi değerlendiren bir sanayi grubu. Yatırım kararından önce orijinal olmayan (aftermarket) yedek parça pazarının büyüklüğünü tahmin etmemizi istiyor. Adaydan, ülkedeki araç parkı, ortalama araç yaşı ve yıllık bakım harcaması gibi varsayımlar üzerinden yapılandırılmış bir pazar büyüklüğü hesaplaması yapmasını bekliyoruz.',
   ARRAY['market_sizing','structuring'], ARRAY['automotive','market-sizing','case-library-v1'], false, false, 'pro', true, false, false),

  ('Soğuk Zincir Lojistik Pazarının Büyüklüğü', 'Donuk gıda taşımacılığı ne kadar büyük?', 'Logistics', 'medium', 'pazar-buyuklugu', 28,
   'Bir ülkedeki soğuk zincir (donmuş/soğutulmuş ürün) lojistik pazarının büyüklüğünü tahmin et.',
   'Müvekkilimiz, soğuk zincir lojistik hizmeti sunmayı planlayan bir yatırım fonu. Yatırım kararı öncesi soğuk zincir taşımacılık ve depolama pazarının büyüklüğünü tahmin etmemizi istiyor. Adaydan, donmuş/soğutulmuş gıda tüketimi, e-ticaret gıda teslimatının büyümesi ve mevcut soğuk depo kapasitesi gibi varsayımlar üzerinden yapılandırılmış bir hesaplama yapmasını bekliyoruz.',
   ARRAY['market_sizing','hypothesis'], ARRAY['logistics','market-sizing','case-library-v1'], false, true, 'pro', true, false, false),

  -- OPERASYON (2)
  ('Hastane Acil Servis Bekleme Süreleri', 'Kök neden nerede?', 'Healthcare', 'hard', 'operasyon', 42,
   'Bir hastanenin acil serviste aşırı uzayan bekleme sürelerinin kök nedenini bul ve operasyonel çözüm öner.',
   'Müvekkilimiz, büyük bir özel hastane zinciri. Acil serviste ortalama bekleme süresi son 1 yılda 45 dakikadan 110 dakikaya çıktı ve hasta memnuniyeti düşüyor. Adaydan süreç, kapasite ve triyaj açısından kök neden analizi yapmasını ve uygulanabilir bir operasyonel iyileştirme planı sunmasını bekliyoruz.',
   ARRAY['structuring','business_judgment'], ARRAY['healthcare','operations','case-library-v1'], false, false, 'pro', true, false, false),

  ('Üretim Hattında Verimlilik Sorunu', 'Duruşlar neden artıyor?', 'Manufacturing', 'medium', 'operasyon', 28,
   'Bir fabrikanın üretim hattındaki artan duruş sürelerinin nedenini bul ve verimliliği artıracak çözüm öner.',
   'Müvekkilimiz, beyaz eşya üreten bir fabrika. Ana üretim hattındaki planlanmamış duruş süreleri son 6 ayda iki katına çıktı ve teslimat gecikmeleri başladı. Adaydan duruşların ekipman arızası, malzeme tedariki veya işgücü kaynaklı mı olduğunu yapılandırılmış şekilde araştırmasını ve verimliliği geri kazandıracak somut bir aksiyon planı önermesini istiyoruz.',
   ARRAY['quantitative','structuring'], ARRAY['manufacturing','operations','case-library-v1'], false, false, 'free', true, false, false),

  -- IS-MODELI (2)
  ('FMCG Markasının Abonelik Modeline Geçişi', 'Tek seferlik satıştan aboneliğe', 'FMCG', 'medium', 'is-modeli', 28,
   'Bir FMCG markasının klasik perakende satıştan abonelik (subscription) modeline geçip geçmemesi gerektiğini değerlendir.',
   'Müvekkilimiz, kişisel bakım ürünleri satan bir FMCG markası. Doğrudan tüketiciye (D2C) abonelik modeliyle satış yapmayı, böylece tekrarlayan gelir elde etmeyi ve perakendeci marjından tasarruf etmeyi değerlendiriyor. Adaydan bu iş modeli değişikliğinin gelir ve marj etkisini, müşteri kabul olasılığını ve mevcut perakende ilişkileriyle çatışma riskini yapılandırılmış şekilde değerlendirmesini istiyoruz.',
   ARRAY['hypothesis','business_judgment'], ARRAY['fmcg','business-model','case-library-v1'], false, false, 'free', true, false, false),

  ('Gıda Şirketinde Bulut Mutfak Modeline Geçiş', 'Fiziksel restorandan dijital mutfağa', 'Food', 'hard', 'is-modeli', 38,
   'Bir restoran zincirinin bulut mutfak (dark kitchen) modeline geçip geçmemesi gerektiğini değerlendir.',
   'Müvekkilimiz, fiziksel şubelerle büyümüş orta ölçekli bir restoran zinciri. Kira ve personel maliyetlerini düşürmek amacıyla bazı şubelerini yalnızca online sipariş için çalışan ''bulut mutfak'' (dark kitchen) modeline dönüştürmeyi değerlendiriyor. Adaydan bu modelin maliyet yapısını, marka bilinirliğine etkisini ve teslimat platformlarına bağımlılık riskini yapılandırılmış şekilde değerlendirmesini istiyoruz.',
   ARRAY['business_judgment','communication'], ARRAY['food','business-model','case-library-v1'], false, false, 'pro', true, false, false)

) as v(
  title, subtitle, industry, difficulty, category, estimated_minutes,
  summary, prompt, skills, tags, is_featured, is_new, min_plan,
  is_published, is_diagnostic, is_drill
)
where not exists (select 1 from public.cases where 'case-library-v1' = any(tags));
