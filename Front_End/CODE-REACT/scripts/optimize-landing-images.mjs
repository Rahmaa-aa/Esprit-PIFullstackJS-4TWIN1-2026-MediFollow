/**
 * Génère des variantes WebP (et PNG/JPEG réencodés) pour le landing.
 * Exécuter après modification des sources : npm run optimize:images
 */
import sharp from "sharp";
import path from "path";
import { writeFile, unlink } from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public", "assets", "images");
const landing = path.join(pub, "landing");

async function writeFileReplace(dest, data) {
  try {
    await unlink(dest);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  await writeFile(dest, data);
}

const logoSrc = path.join(pub, "logosite.png");
const aboutSrc = path.join(landing, "chu-about.jpg");
const heroSrc = path.join(landing, "chu-hero.jpg");

async function main() {
  await sharp(logoSrc)
    .resize({ width: 160 })
    .webp({ quality: 86 })
    .toFile(path.join(pub, "logosite-160.webp"));

  await sharp(logoSrc)
    .resize({ width: 320 })
    .webp({ quality: 86 })
    .toFile(path.join(pub, "logosite-320.webp"));

  const logoPngBuf = await sharp(logoSrc)
    .resize({ width: 320 })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
  await writeFileReplace(path.join(pub, "logosite.png"), logoPngBuf);

  for (const w of [480, 720, 960]) {
    await sharp(aboutSrc)
      .resize({ width: w })
      .webp({ quality: 82 })
      .toFile(path.join(landing, `chu-about-${w}.webp`));
  }

  await sharp(aboutSrc)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(landing, "chu-about-hero.webp"));

  await sharp(aboutSrc)
    .resize({ width: 960 })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(landing, "chu-about-960.jpg"));

  const aboutJpgBuf = await sharp(aboutSrc)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await writeFileReplace(path.join(landing, "chu-about.jpg"), aboutJpgBuf);

  await sharp(heroSrc)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(landing, "chu-hero.webp"));

  const heroJpgBuf = await sharp(heroSrc)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await writeFileReplace(path.join(landing, "chu-hero.jpg"), heroJpgBuf);

  console.log("Landing images optimized.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
