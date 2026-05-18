const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { parseSeedArgs, validateEnvironment } = require("./seed-utils");

/**
 * Script de Hardening para Criação de Administrador Inicial
 * 
 * Uso: 
 *   node scripts/create-admin.js
 *   node scripts/create-admin.js --confirm (exigido em produção)
 *   node scripts/create-admin.js --force --confirm (para resetar senha de admin existente em produção)
 */

function isPasswordSecure(password) {
  if (password.length < 12) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) return false;
  return true;
}

async function main() {
  const options = parseSeedArgs(process.argv.slice(2));
  validateEnvironment("create-admin.js", options);

  const forceReset = process.argv.includes("--force");
  const isProd = process.env.NODE_ENV === "production";
  
  // Prioriza variáveis de ambiente para evitar hardcoded credentials em logs/histórico
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@ip3d.com.br").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "Ip3d@2026";

  console.log("--- Setup de Administrador IP3D ---");

  // Validar segurança da senha
  if (isProd) {
    if (adminPassword === "Ip3d@2026") {
      console.error("[ERRO CRÍTICO] Em produção, você não pode utilizar a senha padrão 'Ip3d@2026'.");
      console.error("Por favor, configure uma senha forte na variável de ambiente ADMIN_PASSWORD.");
      process.exit(1);
    }
    if (!isPasswordSecure(adminPassword)) {
      console.error("[ERRO CRÍTICO] A senha fornecida em ADMIN_PASSWORD não atende aos requisitos mínimos de segurança.");
      console.error("Requisitos em produção: mínimo 12 caracteres, contendo maiúscula, minúscula, número e caractere especial.");
      process.exit(1);
    }
  } else {
    if (adminPassword === "Ip3d@2026") {
      console.log("[AVISO] Utilizando a senha padrão 'Ip3d@2026'. Certifique-se de configurar ADMIN_PASSWORD antes do deploy em produção!");
    } else if (!isPasswordSecure(adminPassword)) {
      console.log("[AVISO] A senha fornecida é fraca. Recomendamos usar uma senha forte (mínimo 12 caracteres, maiúscula, minúscula, número e caractere especial).");
    }
  }

  if (options.dryRun) {
    console.log("\n[SIMULAÇÃO] Modo dry-run ativo. Nenhuma operação executada.");
    console.log(`   Admin a criar/atualizar: ${adminEmail}`);
    return;
  }

  const existing = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
  });

  if (existing) {
    console.log(`[!] Um administrador já existe: ${existing.email} (${existing.role})`);
    
    if (forceReset) {
      console.log(`[*] Flag --force detectada. Resetando senha de ${existing.email}...`);
      const hash = await bcrypt.hash(adminPassword, 12);
      await prisma.user.update({
        where: { id: existing.id },
        data: { 
          password: hash, 
          active: true,
          email: adminEmail // Atualiza para o email fornecido se necessário
        },
      });
      console.log("[+] Senha e status atualizados com sucesso!");
    } else {
      console.log("[!] Operação abortada para evitar sobrescrita acidental.");
      console.log("[!] Use a flag '--force' se realmente desejar resetar a senha do administrador existente.");
    }
  } else {
    console.log(`[*] Nenhum administrador encontrado. Criando SUPER_ADMIN: ${adminEmail}`);
    const hash = await bcrypt.hash(adminPassword, 12);
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hash,
        name: "Administrador Geral",
        role: "SUPER_ADMIN",
        active: true,
      },
    });
    console.log(`[+] SUPER_ADMIN criado com sucesso: ${user.email}`);
  }

  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch((e) => {
    console.error("[EXC] Erro fatal no setup de admin:", e.message);
    process.exit(1);
  });
}

module.exports = { isPasswordSecure, main };
