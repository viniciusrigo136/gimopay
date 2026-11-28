// Falha se o bundle do navegador contiver credenciais privadas:
//  - JWT cujo payload tenha role "service_role"
//  - chave secreta no formato sb_secret_<valor>
// Uso: node scripts/check-bundle-secrets.mjs [pasta] (padrão: dist/client)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? "dist/client";
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(js|html|css|json|map)$/.test(p) && files.push(p); });
walk(root);

const problems = [];
for (const f of files) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.(eyJ[A-Za-z0-9_-]{10,})\.[A-Za-z0-9_-]{10,}/g)) {
    try {
      const payload = JSON.parse(Buffer.from(m[1], "base64url").toString("utf8"));
      if (payload.role && payload.role !== "anon") problems.push(`${f}: JWT com role "${payload.role}"`);
    } catch { /* não é JWT */ }
  }
  for (const m of text.matchAll(/sb_secret_[A-Za-z0-9_-]{8,}/g)) problems.push(`${f}: chave secreta ${m[0].slice(0, 14)}…`);
}
if (problems.length) {
  console.error("Credenciais privadas no bundle do cliente:\n" + problems.join("\n"));
  process.exit(1);
}
console.log(`OK: ${files.length} arquivos verificados, nenhuma credencial privada no bundle.`);
