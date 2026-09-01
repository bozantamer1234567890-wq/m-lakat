import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env.local içinde gerekli.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FALLBACK_CASES = [
  {
    title: "Kahve Zincirinin Kâr Düşüşü",
    industry: "Perakende",
    difficulty: "easy",
    category: "karlilik",
    estimated_minutes: 25,
    summary: "Bir kahve zincirinin son 2 yıldır düşen kârlılığının kaynağını bulup çözüm öner.",
    prompt:
      "Müvekkilimiz, 120 şubesi olan orta ölçekli bir kahve zinciri. Gelirleri sabit kalmasına rağmen son 2 yılda net kârı %30 azaldı. Adaydan kâr düşüşünün kaynağını (gelir mi maliyet mi, hangi segment) yapılandırılmış bir şekilde araştırmasını ve somut bir aksiyon planı önermesini bekliyoruz.",
  },
  {
    title: "Yeni Pazara Giriş: Elektrikli Scooter",
    industry: "Ulaşım / Mobilite",
    difficulty: "medium",
    category: "pazara-girisi",
    estimated_minutes: 35,
    summary: "Bir mobilite şirketinin yeni bir şehre elektrikli scooter filosuyla girip girmemesi gerektiğine karar ver.",
    prompt:
      "Müvekkilimiz büyük bir elektrikli scooter paylaşım şirketi. Yeni bir büyükşehre girmeyi değerlendiriyor. Adaydan pazar büyüklüğü, rekabet, birim ekonomisi ve operasyonel riskleri değerlendirerek gir/girme kararı ve gerekçesini istiyoruz.",
  },
  {
    title: "Hastane Acil Servis Bekleme Süreleri",
    industry: "Sağlık",
    difficulty: "hard",
    category: "operasyon",
    estimated_minutes: 40,
    summary: "Bir hastanenin acil serviste aşırı uzayan bekleme sürelerinin kök nedenini bul ve operasyonel çözüm öner.",
    prompt:
      "Müvekkilimiz büyük bir özel hastane zinciri. Acil serviste ortalama bekleme süresi son 1 yılda 45 dakikadan 110 dakikaya çıktı. Adaydan süreç, kapasite ve triyaj açısından kök neden analizi yapıp uygulanabilir bir iyileştirme planı sunmasını bekliyoruz.",
  },
  {
    title: "SaaS Şirketinde Müşteri Kaybı (Churn)",
    industry: "Teknoloji",
    difficulty: "medium",
    category: "buyume",
    estimated_minutes: 30,
    summary: "B2B SaaS şirketinin artan aylık müşteri kaybını analiz et ve azaltma stratejisi geliştir.",
    prompt:
      "Müvekkilimiz orta ölçekli bir B2B SaaS şirketi. Aylık müşteri kaybı (churn) oranı %2'den %6'ya çıktı. Adaydan churn'ün hangi müşteri segmentinden ve hangi nedenlerden kaynaklandığını yapılandırılmış şekilde araştırmasını ve bir aksiyon planı sunmasını istiyoruz.",
  },
  {
    title: "Havayolu Bilet Fiyatlandırma Stratejisi",
    industry: "Havacılık",
    difficulty: "hard",
    category: "fiyatlandirma",
    estimated_minutes: 35,
    summary: "Bir havayolu şirketinin yeni bir hattaki bilet fiyatlandırma stratejisini belirle.",
    prompt:
      "Müvekkilimiz bölgesel bir havayolu şirketi. Yeni açtığı bir hatta doluluk düşük ama gelir de yeterli değil. Adaydan segmentlere göre fiyatlandırma (bilet sınıfı, rezervasyon zamanı, sadakat) üzerinden bir strateji kurmasını istiyoruz.",
  },
  {
    title: "Gıda Teslimat Şirketleri Birleşmesi",
    industry: "Teknoloji / Lojistik",
    difficulty: "hard",
    category: "birlesme-satin-alma",
    estimated_minutes: 40,
    summary: "İki büyük yemek teslimat platformunun birleşmesinin değerini ve risklerini değerlendir.",
    prompt:
      "Müvekkilimiz, pazarın 2. büyük yemek teslimat platformu, pazarın 4. büyük oyuncusunu satın almayı değerlendiriyor. Adaydan sinerji potansiyeli, entegrasyon riskleri ve rekabet otoritesi engelleri açısından bir değerlendirme ve tavsiye istiyoruz.",
  },
];

async function generateCasesWithAI(count = 4) {
  if (!OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY tanımlı değil, hazır örnek case'ler kullanılacak.");
    return FALLBACK_CASES;
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  console.log(`AI ile ${count} yeni case üretiliyor...`);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Sen üst düzey yönetim danışmanlığı case interview'leri hazırlayan bir uzmansın. Türkçe, gerçekçi ve çeşitli sektörlerden case brief'leri üretiyorsun.",
      },
      {
        role: "user",
        content: `${count} adet case interview senaryosu üret. Her biri farklı bir sektörden, zorluk seviyesinden (easy/medium/hard karışık) ve kategoriden (pazara-girisi/karlilik/buyume/birlesme-satin-alma/fiyatlandirma/operasyon karışık) olsun. Şu JSON şemasına birebir uy: {"cases": [{"title": "...", "industry": "...", "difficulty": "easy|medium|hard", "category": "pazara-girisi|karlilik|buyume|birlesme-satin-alma|fiyatlandirma|operasyon", "estimated_minutes": 20-45, "summary": "tek cümlelik özet", "prompt": "mülakatçıya verilecek 3-5 cümlelik detaylı case brief"}]}`,
      },
    ],
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
  return parsed.cases?.length ? parsed.cases : FALLBACK_CASES;
}

async function seedCases() {
  const { count } = await supabase.from("cases").select("*", { count: "exact", head: true });
  if (count && count > 0) {
    console.log(`cases tablosunda zaten ${count} kayıt var, case üretimi atlanıyor.`);
    const { data } = await supabase.from("cases").select("*");
    return data;
  }

  const cases = await generateCasesWithAI(6);
  const { data, error } = await supabase.from("cases").insert(cases).select("*");
  if (error) throw error;
  console.log(`✓ ${data.length} case eklendi.`);
  return data;
}

async function seedDemoAccount(cases) {
  const demoEmail = "demo@mulakatai.com";
  const demoPassword = "DemoHesap123!";

  let userId;
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === demoEmail);

  if (found) {
    userId = found.id;
    console.log("Demo hesap zaten mevcut, mevcut hesap kullanılıyor.");
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: "Demo Kullanıcı" },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log("✓ Demo hesap oluşturuldu:", demoEmail);
  }

  const { count: sessionCount } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (sessionCount && sessionCount > 0) {
    console.log("Demo hesapta zaten oturum verisi var, seed atlanıyor.");
    return { demoEmail, demoPassword };
  }

  for (let i = 0; i < Math.min(3, cases.length); i++) {
    const c = cases[i];
    const startedAt = new Date(Date.now() - (3 - i) * 86400000);
    const completedAt = new Date(startedAt.getTime() + 25 * 60000);

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        case_id: c.id,
        mode: i % 2 === 0 ? "voice" : "text",
        phase: "completed",
        status: "completed",
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
      })
      .select("id")
      .single();
    if (sessionError) throw sessionError;

    await supabase.from("messages").insert([
      { session_id: session.id, role: "assistant", content: `Merhaba, bugün "${c.title}" case'i üzerinde çalışacağız. ${c.summary}` },
      { session_id: session.id, role: "user", content: "Anladım, öncelikle problemi netleştirmek isterim: ana hedefimiz kârlılığı mı yoksa büyümeyi mi artırmak?" },
      { session_id: session.id, role: "assistant", content: "Güzel soru, hedefimiz kârlılığı artırmak. Nasıl bir yapı ile ilerlemek istersin?" },
      { session_id: session.id, role: "user", content: "Geliri ve maliyeti ayrı ayrı inceleyen bir MECE çerçeve kullanmak istiyorum." },
    ]);

    const overall = 68 + i * 8;
    await supabase.from("feedback").insert({
      session_id: session.id,
      overall_score: overall,
      structure_score: overall - 5,
      analysis_score: overall + 3,
      business_judgment_score: overall - 8,
      communication_score: overall - 2,
      quantitative_reasoning_score: overall - 4,
      strengths: "- Net bir yapı kurdu\n- Varsayımlarını açıkça belirtti",
      improvements: "- Sayısal analizde biraz daha hızlı olabilir\n- Tavsiyeyi daha erken özetleyebilir",
      summary: `${c.title} case'inde genel olarak sağlam bir performans sergiledi, küçük geliştirme alanları mevcut.`,
    });

    console.log(`✓ Demo oturum eklendi: ${c.title}`);
  }

  return { demoEmail, demoPassword };
}

async function main() {
  const cases = await seedCases();
  const demo = await seedDemoAccount(cases);
  console.log("\nSeed tamamlandı.");
  console.log("Demo giriş bilgileri:");
  console.log("  E-posta :", demo.demoEmail);
  console.log("  Şifre   :", demo.demoPassword);
}

main().catch((err) => {
  console.error("Seed hatası:", err);
  process.exit(1);
});
