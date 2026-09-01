-- Skill Drills: short, single-skill practice exercises separate from full
-- case interviews. Reuses the existing sessions/cases/feedback machinery
-- with a dedicated session kind and a handful of seeded drill cases.

alter table public.sessions drop constraint if exists sessions_kind_check;
alter table public.sessions add constraint sessions_kind_check check (kind in ('practice', 'diagnostic', 'drill'));

alter table public.cases
  add column if not exists is_drill boolean not null default false;

insert into public.cases (title, industry, difficulty, category, estimated_minutes, is_published, is_drill, summary, prompt)
select * from (values
  ('Yapı Drilli', 'Genel', 'medium', 'pazara-girisi', 10, false, true,
   'Tek bir problemi hızlıca MECE bir çerçeveyle yapılandırma antrenmanı.',
   'Bu bir DRILL''dir — tam bir case değil, tek bir odaklı sorudur. Aday konuşmaya başladığında (örn. "hazırım" dese bile) hemen kısa bir iş problemi ver (örn. "Bir e-ticaret şirketinin dönüşüm oranı düştü, bunu nasıl yapılandırırsın?") ve adaydan SADECE üst düzey bir MECE çerçeve istemesini iste — hesaplamaya girme. Aday cevap verince kısa bir değerlendirme yap (güçlü/zayıf yön) ve bitir, uzatma.'),
  ('Analiz Drilli', 'Genel', 'medium', 'karlilik', 10, false, true,
   'Kısa bir veri setini yorumlayıp tek bir içgörü çıkarma antrenmanı.',
   'Bu bir DRILL''dir. Aday hazır olduğunda kısa bir kârlılık verisi sun (örn. "Gelir %10 arttı ama net kâr %5 düştü, olası 2 sebep ne olabilir?") ve tek bir net analiz cevabı iste. Cevap gelince kısa değerlendir ve bitir.'),
  ('İş Muhakemesi Drilli', 'Genel', 'medium', 'birlesme-satin-alma', 10, false, true,
   'Belirsizlik altında hızlı ve gerekçeli bir karar verme antrenmanı.',
   'Bu bir DRILL''dir. Aday hazır olduğunda kısa bir karar senaryosu ver (örn. "Küçük ama hızlı büyüyen bir rakibi satın almalı mısınız, düşük bilgiyle karar verin") ve net bir tavsiye + gerekçe iste. Cevap gelince kısa değerlendir ve bitir.'),
  ('İletişim Drilli', 'Genel', 'easy', 'buyume', 8, false, true,
   'Karmaşık bir bulguyu tek cümlede, net şekilde özetleme antrenmanı.',
   'Bu bir DRILL''dir. Aday hazır olduğunda karmaşık bir bulgu ver (birkaç cümlelik veri) ve adaydan bunu YÖNETİCİYE tek cümlelik, net bir "so what" özeti olarak sunmasını iste. Cevap gelince kısa değerlendir ve bitir.'),
  ('Sayısal Akıl Yürütme Drilli', 'Genel', 'medium', 'fiyatlandirma', 8, false, true,
   'Hızlı zihinden hesaplama ve varsayım netliği antrenmanı.',
   'Bu bir DRILL''dir. Aday hazır olduğunda basit ama dikkat gerektiren bir zihinden hesaplama sorusu ver (örn. "48M€ gelir, %12 marj — operasyon kârı ne kadar?"). Cevap gelince doğruluğunu ve varsayım netliğini kısa değerlendir ve bitir.')
) as v(title, industry, difficulty, category, estimated_minutes, is_published, is_drill, summary, prompt)
where not exists (select 1 from public.cases where is_drill = true);
