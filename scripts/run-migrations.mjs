import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("SUPABASE_DB_URL .env.local içinde tanımlı değil.");
  console.error(
    "Örnek: postgresql://postgres:<DB_PASSWORD>@db.<project-ref>.supabase.co:5432/postgres"
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log(`→ ${file} çalıştırılıyor...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await client.query(sql);
    console.log(`✓ ${file} tamamlandı`);
  }

  await client.end();
  console.log("Tüm migration'lar başarıyla uygulandı.");
}

main().catch((err) => {
  console.error("Migration hatası:", err.message);
  process.exit(1);
});
