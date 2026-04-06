const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        active: true,
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📊 TOTAL PRODUTOS: ${products.length}\n`);
    console.log('='.repeat(80));

    const withoutImage = products.filter(p => !p.image);
    const withImage = products.filter(p => p.image);

    console.log(`\n✅ COM FOTO: ${withImage.length}`);
    console.log(`❌ SEM FOTO: ${withoutImage.length}\n`);

    if (withoutImage.length > 0) {
      console.log('PRODUTOS SEM FOTO:');
      console.log('='.repeat(80));
      withoutImage.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Slug: ${p.slug}`);
        console.log(`   Categoria: ${p.category?.name || 'N/A'}`);
        console.log(`   Status: ${p.active ? '✅ Ativo' : '❌ Inativo'}`);
      });
    }

    console.log('\n' + '='.repeat(80));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
