const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        shortDescription: true,
        priceOriginal: true,
        pricePromo: true,
        stockQuantity: true,
        active: true,
        featured: true,
        category: { select: { id: true, name: true, slug: true } },
        categories: { select: { category: { select: { name: true } } } },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n${'='.repeat(100)}`);
    console.log(`📦 RELATÓRIO COMPLETO DE PRODUTOS - IP3D`);
    console.log(`${'='.repeat(100)}\n`);

    console.log(`📊 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total de Produtos: ${products.length}`);
    console.log(`   Produtos Ativos: ${products.filter(p => p.active).length}`);
    console.log(`   Produtos Inativos: ${products.filter(p => !p.active).length}`);
    console.log(`   Produtos Destacados (Featured): ${products.filter(p => p.featured).length}\n`);

    console.log(`${'='.repeat(100)}`);
    console.log(`PRODUTOS DETALHADOS:`);
    console.log(`${'='.repeat(100)}\n`);

    products.forEach((p, i) => {
      const imageStatus = p.image ? '✅' : '❌';
      const descStatus = p.shortDescription ? '✅' : '⚠️';
      const priceStatus = p.priceOriginal || p.pricePromo ? '✅' : '⚠️';
      
      console.log(`${i + 1}. ${p.featured ? '⭐ ' : ''}${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Status: ${p.active ? '✅ Ativo' : '❌ Inativo'}`);
      console.log(`   ${imageStatus} Imagem: ${p.image ? p.image.substring(0, 60) + '...' : 'SEM FOTO'}`);
      console.log(`   ${descStatus} Descrição: ${p.shortDescription ? p.shortDescription.substring(0, 60) + '...' : 'Vazia'}`);
      console.log(`   Categoria: ${p.category?.name || 'N/A'}`);
      console.log(`   ${priceStatus} Preço Original: R$ ${p.priceOriginal || 'N/A'}`);
      console.log(`   Preço Promo: R$ ${p.pricePromo || 'N/A'}`);
      console.log(`   Estoque: ${p.stockQuantity ?? 'N/A'} unidades`);
      console.log(`   Criado: ${new Date(p.createdAt).toLocaleDateString('pt-BR')}`);
      console.log(`   Atualizado: ${new Date(p.updatedAt).toLocaleDateString('pt-BR')}`);
      console.log();
    });

    console.log(`${'='.repeat(100)}`);
    
    const withoutDesc = products.filter(p => !p.shortDescription);
    const withoutPrice = products.filter(p => !p.priceOriginal && !p.pricePromo);
    
    if (withoutDesc.length > 0) {
      console.log(`\n⚠️  PRODUTOS SEM DESCRIÇÃO (${withoutDesc.length}):`);
      withoutDesc.forEach(p => console.log(`   - ${p.name}`));
    }
    
    if (withoutPrice.length > 0) {
      console.log(`\n⚠️  PRODUTOS SEM PREÇO (${withoutPrice.length}):`);
      withoutPrice.forEach(p => console.log(`   - ${p.name}`));
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
