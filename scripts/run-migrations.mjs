import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });
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
  await client.query(
    "create table if not exists public._migrations (filename text primary key, applied_at timestamptz not null default now())"
  );

  const { rows } = await client.query("select filename from public._migrations");
  const applied = new Set(rows.map((r) => r.filename));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`↷ ${file} zaten uygulanmış, atlanıyor.`);
      continue;
    }
    console.log(`→ ${file} çalıştırılıyor...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await client.query(sql);
    await client.query("insert into public._migrations (filename) values ($1)", [file]);
    console.log(`✓ ${file} tamamlandı`);
  }

  await client.end();
  console.log("Tüm migration'lar başarıyla uygulandı.");
}

main().catch((err) => {
  console.error("Migration hatası:", err.message);
  process.exit(1);
});
