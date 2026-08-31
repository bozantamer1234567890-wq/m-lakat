import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Iyzipay from "iyzipay";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const apiKey = process.env.IYZICO_API_KEY;
const secretKey = process.env.IYZICO_SECRET_KEY;
if (!apiKey || !secretKey) {
  console.error("IYZICO_API_KEY ve IYZICO_SECRET_KEY .env.local içinde tanımlı değil.");
  process.exit(1);
}

const iyzipay = new Iyzipay({
  apiKey,
  secretKey,
  uri: process.env.IYZICO_URI || "https://sandbox-api.iyzipay.com",
});

function createProduct() {
  return new Promise((resolve, reject) => {
    iyzipay.subscriptionProduct.create(
      { locale: "tr", conversationId: "prova-setup-product", name: "Prova Pro", description: "Prova sınırsız mülakat pratiği aboneliği" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
  });
}

function createPricingPlan(productReferenceCode) {
  return new Promise((resolve, reject) => {
    iyzipay.subscriptionPricingPlan.create(
      {
        productReferenceCode,
        locale: "tr",
        conversationId: "prova-setup-plan",
        name: "Prova Pro Aylık",
        price: "299",
        currencyCode: "TRY",
        paymentInterval: "MONTHLY",
        paymentIntervalCount: 1,
        trialPeriodDays: 0,
        planPaymentType: "RECURRING",
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
  });
}

function extractReferenceCode(result) {
  return result.data?.referenceCode ?? result.referenceCode;
}

async function main() {
  console.log("iyzico ürünü oluşturuluyor...");
  const product = await createProduct();
  console.log("Ham yanıt (ürün):", JSON.stringify(product, null, 2));
  if (product.status !== "success") {
    console.error("Ürün oluşturulamadı, yukarıdaki yanıta bak.");
    process.exit(1);
  }
  const productReferenceCode = extractReferenceCode(product);
  if (!productReferenceCode) {
    console.error("referenceCode yanıtta bulunamadı — yukarıdaki ham yanıttan elle bul ve devam et.");
    process.exit(1);
  }
  console.log("✓ Ürün oluşturuldu:", productReferenceCode);

  console.log("Fiyat planı oluşturuluyor...");
  const plan = await createPricingPlan(productReferenceCode);
  console.log("Ham yanıt (plan):", JSON.stringify(plan, null, 2));
  if (plan.status !== "success") {
    console.error("Plan oluşturulamadı, yukarıdaki yanıta bak.");
    process.exit(1);
  }
  const planReferenceCode = extractReferenceCode(plan);
  if (!planReferenceCode) {
    console.error("Plan referenceCode yanıtta bulunamadı — yukarıdaki ham yanıttan elle bul.");
    process.exit(1);
  }

  console.log("\n.env.local dosyana şunu ekle:");
  console.log(`IYZICO_PRICING_PLAN_REFERENCE_CODE=${planReferenceCode}`);
}

main().catch((err) => {
  console.error("Kurulum hatası:", err);
  process.exit(1);
});
