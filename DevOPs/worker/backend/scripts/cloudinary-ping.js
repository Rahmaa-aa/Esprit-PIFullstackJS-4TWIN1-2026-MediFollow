/**
 * Vérifie que les identifiants Cloudinary fonctionnent (API Admin « ping », sans upload).
 *
 * Exécuter depuis le dossier backend :
 *   npm run cloudinary:ping
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

function mask(s) {
  const t = String(s || '');
  if (!t.length) return '(vide)';
  if (t.length <= 8) return '***';
  return `${t.slice(0, 3)}…${t.slice(-2)} (${t.length} car.)`;
}

const rawUrl = trim(process.env.CLOUDINARY_URL);
cloudinary.config(true);

if (rawUrl && /^cloudinary:\/\//i.test(rawUrl)) {
  process.env.CLOUDINARY_URL = rawUrl;
  cloudinary.config({ secure: true });
  console.log('[Config] Via CLOUDINARY_URL');
} else {
  const cloud_name = trim(process.env.CLOUDINARY_CLOUD_NAME);
  const api_key = trim(process.env.CLOUDINARY_API_KEY);
  const api_secret = trim(process.env.CLOUDINARY_API_SECRET);
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
  console.log('[Config] Cloud name:', cloud_name || '(vide)');
  console.log('[Config] API Key :', mask(api_key));
  console.log('[Config] Secret  :', mask(api_secret));
}

console.log('');
console.log('Test cloudinary.api.ping() …');

cloudinary.api
  .ping()
  .then((res) => {
    console.log('✓ Succès:', JSON.stringify(res, null, 2));
    console.log('\nLes identifiants sont reconnus. Si l’upload retourne encore 403, le problème vient alors des options d’upload (à simplifier dans le code) ou des restrictions du compte Cloudinary.');
    process.exit(0);
  })
  .catch((err) => {
    const msg = err && err.message ? err.message : String(err);
    const http =
      typeof err.http_code !== 'undefined' ? err.http_code : err.httpCode || err.code;
    console.error('✗ Échec:', msg);
    if (http) console.error('  Code:', http);
    console.error('');
    console.error(
      'Action : tableau de bord Cloudinary → « API Keys » ou « Dashboard » sous Product environment.',
    );
    console.error(
      'Copiez la valeur « CLOUDINARY_URL » complète ou les 3 champs (Cloud name, API Key, API Secret) puis mettez à jour backend/.env sans espace parasite.',
    );
    process.exit(1);
  });
