const sharp = require("sharp");
const path = require("path");

const inputPath = path.join(__dirname, "../public/uploads/products/kit-hotend-creality-cr10-detail-1.png");
const outputPath = path.join(__dirname, "../public/uploads/products/kit-hotend-creality-cr10-detail-1-transparent.png");

async function main() {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

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

  await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .png()
    .toFile(outputPath);

  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
