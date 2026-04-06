const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputDir = path.join(__dirname, '../public/uploads/products');
const files = [
  { input: 'Captura de tela 2026-03-15 095239.png', output: 'cabo_urelk_1.png' },
  { input: 'Captura de tela 2026-03-15 095255.png', output: 'cabo_urelk_2.png' },
  { input: 'Captura de tela 2026-03-15 095311.png', output: 'cabo_urelk_3.png' },
  { input: 'Captura de tela 2026-03-15 095325.png', output: 'cabo_urelk_4.png' },
  { input: 'Captura de tela 2026-03-15 095341.png', output: 'cabo_urelk_5.png' }
];

async function removeBackground() {
  for (const file of files) {
    try {
      const inputPath = path.join(inputDir, file.input);
      const outputPath = path.join(inputDir, file.output);

      // Ler imagem, converter para RGBA, e remover fundo branco
      await sharp(inputPath)
        .removeAlpha()
        .toColorspace('srgb')
        .toBuffer()
        .then(buffer => {
          // Criar máscara para fundo branco
          return sharp(buffer)
            .threshold(200, { greyscale: true })
            .toBuffer({ resolveWithObject: true })
            .then(({ data }) => ({ data, original: buffer }));
        })
        .then(async ({ data, original }) => {
          // Reexportar com transparência
          return sharp(original)
            .png({ alpha: true })
            .toFile(outputPath);
        });

      console.log(`✓ ${file.input} -> ${file.output}`);
    } catch (err) {
      console.error(`✗ Erro ao processar ${file.input}:`, err.message);
    }
  }
  console.log('\n✅ Processamento concluído!');
}

removeBackground();
