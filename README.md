<div align="center">

# 🏥 MediFollow

### Plateforme Web de Suivi Post-Hospitalier à Distance

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-Backend-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/Licence-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Statut-En%20cours-yellow.svg)]()

</div>

---

## 📋 Table des matières

1. [Description](#-description)
2. [Objectifs](#-objectifs)
3. [Fonctionnalités](#-fonctionnalités)
4. [Technologies utilisées](#-technologies-utilisées)
5. [Architecture du projet](#-architecture-du-projet)
6. [Installation et lancement](#-installation-et-lancement)
7. [Structure du projet](#-structure-du-projet)
8. [Captures d'écran](#-captures-décran)
9. [Équipe du projet](#-équipe-du-projet)
10. [Améliorations futures](#-améliorations-futures)
11. [Licence](#-licence)

---

## 📖 Description

**MediFollow** est une plateforme web complète dédiée au **suivi à distance des patients après leur sortie de l'hôpital**. Elle permet de réduire les risques de complications et les réadmissions grâce à un système interactif, ergonomique et sécurisé, connectant les patients à leurs professionnels de santé.

La plateforme assure :
- La collecte et le suivi des paramètres vitaux et des symptômes par les patients
- La consultation et l'analyse des données par les professionnels de santé
- La génération d'alertes automatiques en cas de valeurs anormales
- La traçabilité complète et la sécurité de toutes les informations médicales

> **Projet réalisé dans le cadre du PFE (Projet de Fin d'Études) — ESPRIT, 2025/2026**

---

## 🎯 Objectifs

- Concevoir une application web complète pour le suivi post-hospitalier à distance
- Implémenter différents types d'utilisateurs avec des rôles et des permissions spécifiques
- Assurer la collecte, le traitement et la visualisation de données médicales simples
- Développer un module de notifications et d'alertes automatiques
- Fournir un tableau de bord interactif pour le suivi des patients et les statistiques globales
- Garantir la sécurité, la confidentialité et la traçabilité des informations
- Livrer une interface responsive et ergonomique pour PC, tablette et mobile

---

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- Connexion sécurisée par rôle (JWT + MFA par email pour Admin/Super Admin)
- Gestion des sessions avec déconnexion automatique après inactivité
- Contrôle d'accès basé sur les rôles (RBAC)
- Chiffrement des données sensibles

### 👥 Gestion des Utilisateurs (Super Admin)
- Tableau de bord Super Admin dédié
- Consultation de la liste complète de tous les utilisateurs (patients, médecins, infirmiers, admins, auditeurs, coordinateurs)
- CRUD complet pour les **Auditeurs** et les **Coordinateurs de soins**
- Activation / désactivation des comptes utilisateurs
- Modification du profil avec changement de mot de passe

### 🩺 Suivi des Patients
- Saisie des paramètres vitaux : température, tension artérielle, poids, fréquence cardiaque
- Déclaration des symptômes : douleur, fatigue, essoufflement, nausées…
- Réponse aux questionnaires post-hospitaliers personnalisés
- Consultation de l'historique personnel avec visualisation graphique
- Envoi de notes et messages au médecin

### 📊 Tableau de Bord Médical
- Vue d'ensemble des patients avec statistiques
- Graphiques d'évolution des paramètres vitaux
- Indicateurs de conformité des questionnaires
- Filtres par patient, période et type de paramètre

### 🚨 Alertes & Notifications
- Détection automatique des valeurs anormales par seuils configurables
- Notifications instantanées aux médecins et coordinateurs
- Historique des alertes avec validation par le personnel soignant
- Système de rappels automatiques pour les patients

### 📁 Gestion des Services Hospitaliers
- Gestion des unités et services hospitaliers
- Questionnaires personnalisés par service
- Export des données en CSV / PDF

### 🔎 Traçabilité & Audit
- Journal complet des actions utilisateurs
- Historique horodaté de toutes les modifications
- Rapport d'audit accessible aux auditeurs qualité
- Vérification de l'intégrité des données

### 🖥️ Interface Utilisateur
- Design responsive (PC, tablette, mobile)
- Connexion biométrique par reconnaissance faciale
- Navigation vocale et accessibilité avancée (lecture de page, dictée vocale)
- Validation des formulaires en temps réel

---

## 🛠️ Technologies utilisées

### Frontend
| Technologie | Rôle |
|---|---|
| **React 18** + **Vite** | Framework UI et bundler |
| **React Router v6** | Navigation SPA |
| **Bootstrap 5** | Design et composants UI |
| **Axios / Fetch API** | Appels HTTP |
| **Chart.js / Recharts** | Visualisation des données |
| **face-api.js** | Authentification faciale |
| **Web Speech API** | Navigation vocale |

### Backend
| Technologie | Rôle |
|---|---|
| **NestJS** | Framework backend Node.js |
| **Mongoose** | ORM pour MongoDB |
| **Passport.js + JWT** | Authentification et autorisation |
| **bcrypt** | Hachage des mots de passe |
| **Nodemailer** | Envoi d'emails (MFA, notifications) |
| **Multer** | Upload de fichiers |

### Base de données & Infrastructure
| Outil | Usage |
|---|---|
| **MongoDB Atlas** | Base de données cloud NoSQL |
| **Git / GitHub** | Versionnement et collaboration |
| **GitHub Actions** | CI/CD |
| **Postman** | Tests d'API |
| **Figma** | Maquettes UI/UX |

---

## 🏗️ Architecture du projet

```
MediFollow
├── Architecture : Client-Serveur / SPA + REST API
├── Frontend     : Single Page Application (React + Vite)
├── Backend      : API REST (NestJS)
├── Base de données : MongoDB Atlas (NoSQL)
└── Auth         : JWT avec MFA email (admin/superadmin)
                   JWT direct (staff, patient, médecin, infirmier)
```

### Rôles et accès
| Rôle | Accès |
|---|---|
| **Super Admin** | Gestion globale de la plateforme, tous les utilisateurs, audit |
| **Administrateur** | Gestion des patients, médecins, infirmiers, alertes |
| **Médecin** | Suivi quotidien, analyse des données, gestion des alertes |
| **Infirmier** | Aide à la saisie, suivi des alertes, rappels patients |
| **Coordinateur** | Supervision du protocole, communication avec les patients |
| **Auditeur** | Consultation des logs et historiques pour la traçabilité |
| **Patient** | Saisie des symptômes, questionnaires, historique personnel |

---

## 🚀 Installation et lancement

### Prérequis
- **Node.js** v18 ou supérieur
- **npm** v9 ou supérieur
- Un compte **MongoDB Atlas** (ou MongoDB local)
- Un compte **Gmail** avec mot de passe d'application (pour les emails MFA)

### 1. Cloner le dépôt

```bash
git clone https://github.com/khalilhl/MediFollow.git
cd MediFollow
git checkout User_branch
```

### 2. Configuration du Backend

```bash
cd backend
npm install
```

Créer le fichier `.env` dans `backend/` :

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medifollow
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
```

Démarrer le backend :

```bash
npm run start:dev
# API disponible sur http://localhost:3000
```

### 3. Configuration du Frontend

```bash
cd Front_End/CODE-REACT
npm install
npm run dev
# Application disponible sur http://localhost:5173
```

### 4. Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Super Admin | `superadmin@medifollow.com` | `SuperAdmin123!` |
| Admin | `admin@medifollow.com` | `Admin123!` |
| *(Autres comptes à créer via le Super Admin)* | — | — |

> ⚠️ Les comptes Admin et Super Admin nécessitent une **confirmation par email** (MFA) lors de la connexion.

---

## 📁 Structure du projet

```
MediFollow/
├── backend/                        # API NestJS
│   └── src/
│       ├── auth/                   # Authentification, JWT, MFA, Super Admin
│       ├── doctor/                 # Module médecin (CRUD + toggle actif)
│       ├── patient/                # Module patient (CRUD + toggle actif)
│       ├── nurse/                  # Module infirmier (CRUD + toggle actif)
│       └── main.ts
│
└── Front_End/CODE-REACT/           # Application React
    └── src/
        ├── components/
        │   └── partials/sidebar/   # Navigation latérale (avec section Super Admin)
        ├── views/
        │   ├── auth/               # Connexion, confirmation, récupération mot de passe
        │   ├── super-admin/        # Dashboard, user-list, auditors, care-coordinators
        │   ├── dashboard/          # Tableau de bord médecin
        │   └── dashboard-pages/    # Tableaux de bord patient et infirmier
        ├── services/
        │   └── api.js              # Centralisation des appels API
        └── router/
            └── default-router.jsx  # Routes de l'application
```

---

## 📸 Captures d'écran

> *Captures à ajouter après la finalisation de l'interface*

| Page | Description |
|---|---|
| 🔐 Page de connexion | Authentification avec MFA et reconnaissance faciale |
| 📊 Dashboard Super Admin | Vue globale de tous les utilisateurs |
| 👤 Liste des utilisateurs | Gestion et activation/désactivation des comptes |
| 🩺 Dashboard Médecin | Suivi des patients avec graphiques |
| 📋 Formulaire Patient | Saisie des paramètres vitaux |
| 🚨 Module Alertes | Notifications et gestion des alertes |

---

## 👥 Équipe du projet

**Équipe CodeCraft**

| Nom | Rôle |
|---|---|
| **Khalki Imen Allah** | Développeuse Full Stack — Module Super Admin, Authentification |
| **Kacem Trabelsi** | Développeur Full Stack |
| **Khalil Hlila** | Développeur Full Stack |
| **Rahma Ayed** | Développeuse Full Stack |
| **Ayoub Ben Mohamed** | Développeur Full Stack |

> **Encadrante :** Mme. Asma Ayari
> **Institution :** ESPRIT — École Supérieure Privée d'Ingénierie et de Technologies
> **Année académique :** 2025/2026

---

## 🔮 Améliorations futures

- [ ] Application mobile React Native pour les patients
- [ ] Intégration de capteurs IoT pour la collecte automatique des paramètres vitaux
- [ ] Intelligence artificielle pour la prédiction des risques de réadmission
- [ ] Module de téléconsultation (vidéo/chat en temps réel)
- [ ] Export des rapports médicaux en PDF personnalisé
- [ ] Système de prescription électronique
- [ ] Internationalisation complète (multilingue)
- [ ] Intégration avec les systèmes d'information hospitaliers (HL7/FHIR)

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

**MediFollow** — *Connecting Patients and Healthcare Professionals*

Développé avec ❤️ par l'équipe **CodeCraft** — ESPRIT 2025/2026

</div>
