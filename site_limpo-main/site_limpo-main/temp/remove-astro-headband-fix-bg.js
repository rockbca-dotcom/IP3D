const sharp = require("sharp");
const path = require("path");

const images = [
  {
    inputUrl: "https://http2.mlstatic.com/D_NQ_NP_600736-MLB88972505690_082025-O.webp",
    outputPath: path.join(
      __dirname,
      "../public/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-1-transparent.png"
    ),
  },
  {
    inputUrl: "https://http2.mlstatic.com/D_NQ_NP_705440-MLB82015549351_012025-O.webp",
    outputPath: path.join(
      __dirname,
      "../public/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-2-transparent.png"
    ),
  },
  {
    inputUrl: "https://http2.mlstatic.com/D_NQ_NP_842393-MLB75955789651_042024-O.webp",
    outputPath: path.join(
      __dirname,
      "../public/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-3-transparent.png"
    ),
  },
  {
    inputUrl: "https://http2.mlstatic.com/D_NQ_NP_974121-MLB75955779595_042024-O.webp",
    outputPath: path.join(
      __dirname,
      "../public/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-4-transparent.png"
    ),
  },
  {
    inputUrl: "https://http2.mlstatic.com/D_NQ_NP_904305-MLB82015374023_012025-O.webp",
    outputPath: path.join(
      __dirname,
      "../public/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-5-transparent.png"
    ),
  },
];

function removeWhiteBackground(data, info) {
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  function index(x, y) {
    return (y * width + x) * channels;
  }

  function getPixel(x, y) {
    const i = index(x, y);
    return {
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
      a: data[i + 3],
    };
  }

  function isNearWhite(pixel) {
    return pixel.a > 0 && pixel.r >= 235 && pixel.g >= 235 && pixel.b >= 235;
  }

  const visited = new Uint8Array(width * height);
  const queue = [];
  let head = 0;

  for (let x = 0; x < width; x++) {
    queue.push([x, 0], [x, height - 1]);
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push([0, y], [width - 1, y]);
  }

  while (head < queue.length) {
    const [x, y] = queue[head++];
    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    const pos = y * width + x;
    if (visited[pos]) continue;
    visited[pos] = 1;

    const pixel = getPixel(x, y);
    if (!isNearWhite(pixel)) continue;

    const i = index(x, y);
    data[i + 3] = 0;

    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return { data, width, height, channels };
}

async function processImage({ inputUrl, outputPath }) {
  const response = await fetch(inputUrl);
  if (!response.ok) {
    throw new Error(`Falha ao baixar imagem: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const image = sharp(inputBuffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const transparent = removeWhiteBackground(data, info);

  await sharp(transparent.data, {
    raw: {
      width: transparent.width,
      height: transparent.height,
      channels: transparent.channels,
    },
  })
    .png()
    .toFile(outputPath);

  console.log(outputPath);
}

async function main() {
  for (const image of images) {
    await processImage(image);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
