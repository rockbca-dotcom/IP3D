const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function attachImagesToProduct() {
  try {
    // ID do produto Termistor
    const productId = 'cmmhxuvxh0010pu6jv1m4hmha';
    
    // Array de imagens para anexar
    const images = [
      '/uploads/products/cabo_urelk_1.png',
      '/uploads/products/cabo_urelk_2.png',
      '/uploads/products/cabo_urelk_3.png',
      '/uploads/products/cabo_urelk_4.png',
      '/uploads/products/cabo_urelk_5.png'
    ];

    // Atualizar produto com as novas imagens
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        image: images[0], // Imagem principal (primeira imagem)
        gallery: images   // Array de todas as imagens na galeria
      },
      select: {
        id: true,
        name: true,
        image: true,
        gallery: true
      }
    });

    console.log('✅ Produto atualizado com sucesso!\n');
    console.log('📦 Termistor NTC 100K:');
    console.log(`   ID: ${updatedProduct.id}`);
    console.log(`   Nome: ${updatedProduct.name}`);
    console.log(`   Imagem Principal: ${updatedProduct.image}`);
    console.log(`   Galeria (${updatedProduct.gallery.length} imagens):`);
    updatedProduct.gallery.forEach((img, i) => {
      console.log(`     ${i + 1}. ${img}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

attachImagesToProduct();
