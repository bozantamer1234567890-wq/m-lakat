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

const PRODUCT_NAME = "Prova";
const PLANS = [
  { envVar: "IYZICO_PRICING_PLAN_REFERENCE_CODE", name: "Prova Pro Aylık", price: "399", interval: "MONTHLY", count: 1 },
  { envVar: "IYZICO_PRICING_PLAN_REFERENCE_CODE_YEARLY", name: "Prova Pro Yıllık", price: "3990", interval: "YEARLY", count: 1 },
  { envVar: "IYZICO_PRICING_PLAN_REFERENCE_CODE_COACH_MONTHLY", name: "Prova Coach Aylık", price: "699", interval: "MONTHLY", count: 1 },
  { envVar: "IYZICO_PRICING_PLAN_REFERENCE_CODE_COACH_YEARLY", name: "Prova Coach Yıllık", price: "6990", interval: "YEARLY", count: 1 },
];

function extractReferenceCode(result) {
  return result.data?.referenceCode ?? result.referenceCode;
}

function extractList(result) {
  return result.data?.items ?? result.items ?? [];
}

function findOrCreateProduct() {
  return new Promise((resolve, reject) => {
    iyzipay.subscriptionProduct.retrieveList({ locale: "tr", page: 1, count: 50 }, (err, result) => {
      if (err) return reject(err);
      if (result.status !== "success") return reject(new Error(JSON.stringify(result)));
      const existing = extractList(result).find((p) => p.name === PRODUCT_NAME);
      if (existing) return resolve(existing.referenceCode);

      iyzipay.subscriptionProduct.create(
        { locale: "tr", conversationId: "prova-setup-product", name: PRODUCT_NAME, description: "Prova Pro ve Coach abonelik planları" },
        (createErr, createResult) => {
          if (createErr) return reject(createErr);
          if (createResult.status !== "success") return reject(new Error(JSON.stringify(createResult)));
          const code = extractReferenceCode(createResult);
          if (!code) return reject(new Error("Ürün referenceCode bulunamadı: " + JSON.stringify(createResult)));
          resolve(code);
        }
      );
    });
  });
}

function findExistingPlan(productReferenceCode, name) {
  return new Promise((resolve, reject) => {
    iyzipay.subscriptionPricingPlan.retrieveList(
      { productReferenceCode, locale: "tr", page: 1, count: 50 },
      (err, result) => {
        if (err) return reject(err);
        if (result.status !== "success") return reject(new Error(JSON.stringify(result)));
        const existing = extractList(result).find((p) => p.name === name);
        resolve(existing?.referenceCode ?? null);
      }
    );
  });
}

function createPlan(productReferenceCode, plan) {
  return new Promise((resolve, reject) => {
    iyzipay.subscriptionPricingPlan.create(
      {
        productReferenceCode,
        locale: "tr",
        conversationId: `prova-setup-plan-${plan.interval.toLowerCase()}`,
        name: plan.name,
        price: plan.price,
        currencyCode: "TRY",
        paymentInterval: plan.interval,
        paymentIntervalCount: plan.count,
        trialPeriodDays: 0,
        planPaymentType: "RECURRING",
      },
      (err, result) => {
        if (err) return reject(err);
        if (result.status !== "success") return reject(new Error(JSON.stringify(result)));
        const code = extractReferenceCode(result);
        if (!code) return reject(new Error("Plan referenceCode bulunamadı: " + JSON.stringify(result)));
        resolve(code);
      }
    );
  });
}

async function main() {
  console.log(`Ürün kontrol ediliyor: ${PRODUCT_NAME}...`);
  const productReferenceCode = await findOrCreateProduct();
  console.log("✓ Ürün:", productReferenceCode);

  const envLines = [];
  for (const plan of PLANS) {
    console.log(`\nPlan kontrol ediliyor: ${plan.name}...`);
    let referenceCode = await findExistingPlan(productReferenceCode, plan.name);
    if (referenceCode) {
      console.log(`✓ Zaten mevcut: ${referenceCode}`);
    } else {
      referenceCode = await createPlan(productReferenceCode, plan);
      console.log(`✓ Oluşturuldu: ${referenceCode}`);
    }
    envLines.push(`${plan.envVar}=${referenceCode}`);
  }

  console.log("\n.env.local dosyana şunları ekle (varsa güncelle):");
  envLines.forEach((line) => console.log(line));
}

main().catch((err) => {
  console.error("Kurulum hatası:", err);
  process.exit(1);
});
