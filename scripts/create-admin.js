const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
  });

  if (existing) {
    console.log("Admin já existe:", existing.email, "| role:", existing.role);
    console.log("Resetando senha para: Ip3d@2026");
    const hash = await bcrypt.hash("Ip3d@2026", 12);
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hash, active: true },
    });
    console.log("Senha atualizada com sucesso!");
  } else {
    console.log("Nenhum admin encontrado. Criando...");
    const hash = await bcrypt.hash("Ip3d@2026", 12);
    const user = await prisma.user.create({
      data: {
        email: "admin@ip3d.com.br",
        password: hash,
        name: "Administrador",
        role: "SUPER_ADMIN",
        active: true,
      },
    });
    console.log("Admin criado:", user.email);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
