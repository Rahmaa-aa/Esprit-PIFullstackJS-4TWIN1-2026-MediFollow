/**
 * Petit upload PNG 1×1 pour valider l’endpoint /upload vs ping.
 *
 * npm run cloudinary:test-upload
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n');
  content.split('\n').forEach((line0) => {
    let line = line0.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx <= 0) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    val = val.replace(/^["'\s]+|["'\s]+$/g, '');
    process.env[key] = val;
  });
}

const cloudinary = require('cloudinary').v2;

function trim(s) {
  return String(s || '')
    .trim()
    .replace(/^["'\s]+|["'\s]+$/g, '');
}

const rawUrl = trim(process.env.CLOUDINARY_URL);
cloudinary.config(true);

if (rawUrl && /^cloudinary:\/\//i.test(rawUrl)) {
  process.env.CLOUDINARY_URL = rawUrl;
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: trim(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: trim(process.env.CLOUDINARY_API_KEY),
    api_secret: trim(process.env.CLOUDINARY_API_SECRET),
    secure: true,
  });
}

const tiny =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

console.log('Test upload_png (options minimales + folder médifollow) …');

cloudinary.uploader.upload(
  `data:image/png;base64,${tiny}`,
  { folder: 'medifollow/ping-test', public_id: 'pixel_debug', overwrite: true },
  (err, res) => {
    if (err) {
      console.error('✗ Erreur upload:', err.message || err);
      console.error(JSON.stringify(err, null, 2));
      process.exit(1);
    }
    console.log('✓ OK:', res.secure_url);
    process.exit(0);
  },
);
