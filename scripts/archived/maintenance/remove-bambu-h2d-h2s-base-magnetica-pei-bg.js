import fs from "fs";
import path from "path";
import https from "https";
import sharp from "sharp";

const imageUrls = [
  "https://http2.mlstatic.com/D_NQ_NP_736774-MLB109923436021_042026-O.webp",
  "https://http2.mlstatic.com/D_NQ_NP_679520-MLB109419316078_042026-O.webp",
  "https://http2.mlstatic.com/D_NQ_NP_608125-MLB109925375353_042026-O.webp",
  "https://http2.mlstatic.com/D_NQ_NP_935604-MLB109085442212_042026-O.webp",
  "https://http2.mlstatic.com/D_NQ_NP_885345-MLB109923376003_042026-O.webp",
  "https://http2.mlstatic.com/D_NQ_NP_969624-MLB109922481631_042026-O.webp",
  "https://http2.mlstatic.com/D_NQ_NP_859401-MLB109923106963_042026-O.webp",
];

const outputDir = path.join(__dirname, "..", "public", "uploads", "products");
const slugBase = "base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          return resolve(downloadBuffer(response.headers.location));
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Falha ao baixar ${url}: status ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function colorDistance(r, g, b, target) {
  return Math.sqrt(
    Math.pow(r - target[0], 2) +
      Math.pow(g - target[1], 2) +
      Math.pow(b - target[2], 2)
  );
}

async function removeBackground(buffer) {
  const image = sharp(buffer).ensureAlpha();
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const corners = [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1],
  ];

  const avg = [0, 0, 0];
  for (const [x, y] of corners) {
    const idx = (y * info.width + x) * 4;
    avg[0] += data[idx];
    avg[1] += data[idx + 1];
    avg[2] += data[idx + 2];
  }

  avg[0] /= corners.length;
  avg[1] /= corners.length;
  avg[2] /= corners.length;

  const threshold = 38;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const distance = colorDistance(r, g, b, avg);

    if (distance < threshold) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

async function main() {
  for (let index = 0; index < imageUrls.length; index += 1) {
    const url = imageUrls[index];
    const inputBuffer = await downloadBuffer(url);
    const outputBuffer = await removeBackground(inputBuffer);
    const outputName = `${slugBase}-${index + 1}-transparent.png`;
    const outputPath = path.join(outputDir, outputName);
    fs.writeFileSync(outputPath, outputBuffer);
    console.log(outputPath);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
