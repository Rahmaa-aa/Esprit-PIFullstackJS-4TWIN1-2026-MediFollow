# MediFollow Backend - NestJS + MongoDB Atlas

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copiez `.env.example` vers `.env`
2. Configurez votre connection MongoDB Atlas dans `MONGODB_URI`
3. Optionnel : changez `JWT_SECRET` en production

## Créer un admin

Avant de vous connecter, créez un compte admin :

```bash
# Démarrer le serveur
npm run start:dev
```

**Windows PowerShell** (dans un autre terminal) :
```powershell
.\seed-admin.ps1
```

Ou manuellement :
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/seed-admin" -Method POST -ContentType "application/json" -Body '{"email":"admin@medifollow.com","password":"Admin123!"}'
```

**Linux / Mac / Git Bash** :
```bash
curl -X POST http://localhost:3000/api/auth/seed-admin -H "Content-Type: application/json" -d '{"email":"admin@medifollow.com","password":"Admin123!"}'
```

Identifiants par défaut :
- Email : `admin@medifollow.com`
- Mot de passe : `Admin123!`

## Session admin

Une fois l'admin créé, connectez-vous via l'endpoint :

```http
POST /api/auth/login
```

Puis confirmez la session avec le token reçu par email via :

```http
POST /api/auth/confirm-login
```

La réponse retourne `access_token` et l'objet `user`, à stocker côté frontend pour ouvrir la session admin.

## Session docteur et profil

Pour un compte docteur, utilisez:

```http
POST /api/auth/doctor-login
```

Après authentification, stockez `access_token` dans le frontend et utilisez ce token pour récupérer/modifier le profil:

```http
GET /api/auth/me
PUT /api/auth/me
```

Le profil docteur peut ensuite être affiché dans la page `doctor-profile` avec les informations de session.

## Lancement

```bash
npm run start:dev
```

## Frontend

Dans le frontend, créez un fichier `.env` avec :
```
VITE_API_URL=http://localhost:3000/api
```
