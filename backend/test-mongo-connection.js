/**
 * Script de test de connexion MongoDB Atlas
 * Exécuter : node test-mongo-connection.js
 */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const idx = line.indexOf('=');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  });
}
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI non défini dans .env');
  process.exit(1);
}

console.log('Test de connexion à MongoDB Atlas...');
console.log('URI (masqué):', uri.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
})
  .then(() => {
    console.log('✓ Connexion réussie!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Erreur:', err.message);
    if (err.reason) console.error('Cause:', err.reason);
    process.exit(1);
  });
