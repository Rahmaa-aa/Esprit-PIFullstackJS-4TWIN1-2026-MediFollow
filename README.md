<div align="center">

# 🏥 MediFollow

### Web Platform for Post-Hospitalization Remote Monitoring and Continuous Patient Follow-up

---

👥 **Team CodeCraft** &nbsp;|&nbsp; 🏫 **ESPRIT — École Supérieure Privée d'Ingénierie et de Technologies** &nbsp;|&nbsp; 📅 **2025/2026**

👩‍🏫 **Supervisor:** Mrs. Asma Ayari

---

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-Backend-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Progress-yellow.svg)]()

</div>

---

## 📋 Table of Contents

1. [Description](#-description)
2. [Objectives](#-objectives)
3. [Features](#-features)
4. [Accessibility](#-accessibility)
5. [Technologies Used](#-technologies-used)
6. [Project Architecture](#-project-architecture)
7. [Installation & Setup](#-installation--setup)
8. [Project Structure](#-project-structure)
9. [Screenshots](#-screenshots)
10. [Team](#-team)
11. [Future Improvements](#-future-improvements)
12. [License](#-license)

---

## 📖 Description

**MediFollow** is a comprehensive web-based platform designed to enable **remote monitoring of patients after hospital discharge**. The platform aims to reduce the risk of complications and readmissions through an interactive, ergonomic, and secure system that connects patients with their healthcare professionals.

The platform ensures:
- Collection and tracking of vital parameters and symptoms entered by patients
- Consultation and analysis of patient data by healthcare professionals
- Automatic alerts for abnormal values
- Complete traceability and security of all medical information

> 📚 **Project developed as part of the Integrated Project (PI) — practical skills enhancement program**
> **ESPRIT — École Supérieure Privée d'Ingénierie et de Technologies | Academic Year 2025/2026**

---

## 🎯 Objectives

- Design a complete, professional web application for post-hospitalization remote monitoring
- Implement different user types with specific roles and appropriate permissions
- Ensure collection, processing, and visualization of medical data
- Develop an automatic notification and alert module
- Provide an interactive dashboard for patient monitoring and global statistics
- Guarantee security, confidentiality, and traceability of all information
- Deliver a **responsive and accessible interface** for PC, tablet, and mobile

---

## ✨ Features

### 🔐 Authentication & Security
- Secure role-based login with **JWT tokens**
- **Multi-Factor Authentication (MFA)** via email confirmation for Admin and Super Admin
- Password management with bcrypt hashing
- Session management with automatic logout after inactivity
- Role-Based Access Control (RBAC)

### 👑 Super Admin Module
- Dedicated Super Admin dashboard
- Full user list across all roles: patients, doctors, nurses, admins, auditors, care coordinators
- Complete **CRUD for Auditors and Care Coordinators**
- Account activation / deactivation for all users
- Super Admin profile editing with password change

### 🩺 Patient Monitoring
- Entry of vital parameters: temperature, blood pressure, weight, heart rate
- Symptom reporting: pain, fatigue, shortness of breath, nausea…
- Post-hospitalization questionnaires
- Personal follow-up history with graphical visualization
- Notes and messages to physicians

### 📊 Medical Dashboard
- Patient overview with statistics
- Vital parameter evolution charts
- Questionnaire compliance indicators
- Filters by patient, period, and parameter type

### 🚨 Alerts & Notifications
- Automatic detection of abnormal values with configurable thresholds
- Instant notifications to physicians and coordinators
- Alert history with validation by healthcare staff
- Automatic reminder system for incomplete follow-ups

### 🏥 Hospital Service Management
- Management of hospital units and departments
- Customized questionnaires per service
- Data export in CSV / PDF format

### 🔎 Audit & Traceability
- Complete logging of all user actions
- Timestamped modification history
- Audit trail accessible to auditors and quality managers

---

## ♿ Accessibility

MediFollow is built with a strong focus on **inclusive design**, making the platform usable by people with disabilities or those who cannot easily type. The following accessibility features are integrated directly into the login page and throughout the platform:

### 🎤 Voice Input (Speech-to-Text)
> For users who **cannot type** their email or password
- Microphone buttons on the **Email** and **Password** fields allow dictating credentials using the browser's Web Speech API
- Simply click the mic icon and speak — the text is automatically filled in
- Say **"stop"** to end the voice session at any time

### 🔊 Text-to-Speech (Page Reading)
> For visually impaired users or those with reading difficulties
- A **"Read Page"** button reads the entire page content aloud step-by-step
- Uses the browser's SpeechSynthesis API
- Guides users through the login steps verbally

### 👁️ Facial Recognition Login
> For users who **cannot use a keyboard or mouse**
- Camera-based **automatic face recognition** — no typing required
- Opens the device camera and automatically identifies the user within seconds
- Built with `face-api.js` for real-time face descriptor matching
- Users must enroll their face once through their profile settings

### 🖐️ Finger / Hand Gesture Navigation
> For users with **motor disabilities** who cannot use a mouse
- Camera-based **finger gesture control** simulates mouse movement and clicks
- Users navigate and interact with the interface using hand gestures captured by the webcam
- Allows full interaction with the login form without a physical mouse or touchscreen

### 🔠 Large Text Mode
> For users with **visual impairments**
- Toggle button switches the entire sign-in page to a **large text mode**
- Preference is saved in localStorage for subsequent visits

### 📋 Summary of Accessibility Features

| Feature | Technology | Who it helps |
|---|---|---|
| Voice Input for Email/Password | Web Speech API (STT) | Users who cannot type |
| Page Reading Aloud | Web Speech API (TTS) | Visually impaired users |
| Facial Recognition Login | face-api.js | Users who cannot use keyboard/mouse |
| Finger Gesture Navigation | Camera + gesture detection | Users with motor disabilities |
| Large Text Mode | CSS + localStorage | Users with visual impairments |

---

## 🛠️ Technologies Used

### Frontend
| Technology | Role |
|---|---|
| **React 18** + **Vite** | UI framework and build tool |
| **React Router v6** | SPA navigation |
| **Bootstrap 5** | UI design and components |
| **Fetch API** | HTTP requests to the backend |
| **Chart.js / Recharts** | Data visualization |
| **face-api.js** | Facial recognition login |
| **Web Speech API** | Voice input and text-to-speech |
| **MediaDevices API** | Camera access for face & gesture |

### Backend
| Technology | Role |
|---|---|
| **NestJS** | Node.js backend framework |
| **Mongoose** | MongoDB ORM |
| **Passport.js + JWT** | Authentication and authorization |
| **bcrypt** | Password hashing |
| **Nodemailer** | Email sending (MFA, notifications) |
| **Multer** | File upload handling |

### Database & Infrastructure
| Tool | Usage |
|---|---|
| **MongoDB Atlas** | Cloud NoSQL database |
| **Git / GitHub** | Version control and collaboration |
| **GitHub Actions** | CI/CD pipelines |
| **Postman** | API testing |
| **Figma** | UI/UX mockups |

---

## 🏗️ Project Architecture

```
MediFollow
├── Architecture  : Client-Server / SPA + REST API
├── Frontend      : Single Page Application (React + Vite)
├── Backend       : REST API (NestJS)
├── Database      : MongoDB Atlas (NoSQL)
└── Auth          : JWT + MFA via email (Admin / Super Admin)
                    JWT direct login (Staff, Patient, Doctor, Nurse)
```

### User Roles & Access

| Role | Access Level |
|---|---|
| **Super Admin** | Full platform management, all users, global audit |
| **Administrator** | Manage patients, doctors, nurses, alerts |
| **Doctor** | Daily monitoring, data analysis, alert management |
| **Nurse** | Data entry assistance, alert monitoring, patient reminders |
| **Care Coordinator** | Follow-up protocol supervision, patient communication |
| **Auditor** | Consultation of logs and action histories |
| **Patient** | Symptom entry, questionnaires, personal history |

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** account (or local MongoDB)
- A **Gmail** account with App Password (for MFA emails)

### 1. Clone the Repository

```bash
git clone https://github.com/khalilhl/MediFollow.git
cd MediFollow
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create the `.env` file inside `backend/`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medifollow
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

Start the backend:

```bash
npm run start:dev
# API available at http://localhost:3000
```

### 2.5 Brain MRI analysis (Python + TensorFlow) — required for `/doctor/brain-mri`

The folder `brain-tumor-detection/` is part of the repo, but **model files** (`.keras`) are not committed. On a **new machine**, run once:

**Windows (PowerShell):**

```powershell
cd brain-tumor-detection
.\Install-BrainTumorEnv.ps1
```

If you see a **Pester** error about `Setup`, run:

```powershell
powershell -NoProfile -File .\Install-BrainTumorEnv.ps1
```

**Linux / macOS:**

```bash
cd brain-tumor-detection
chmod +x setup_from_zero.sh && ./setup_from_zero.sh
```

This creates a local virtualenv, installs dependencies, and generates `brain_tumor_resnet.keras`. See `brain-tumor-detection/README.md` for training on a real dataset.

**Windows:** if `pip install tensorflow` fails with a long path / `OSError`, enable **long paths** in Windows (registry `LongPathsEnabled = 1`, then reboot) or clone the repo to a shorter folder (e.g. `C:\dev\MediFollow`). Details: `brain-tumor-detection/README.md` section *Windows — TensorFlow / long paths*.

### 3. Frontend Setup

```bash
cd Front_End/CODE-REACT
npm install
npm run dev
# App available at http://localhost:5173
```

### 4. Default Test Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@medifollow.com` | `SuperAdmin123!` |
| Admin | `admin@medifollow.com` | `Admin123!` |
| *(Other accounts)* | *Create via Super Admin panel* | — |

> ⚠️ Admin and Super Admin accounts require **email confirmation (MFA)** upon login.

---

## 📁 Project Structure

```
MediFollow/
├── brain-tumor-detection/            # Python + TensorFlow (brain MRI analysis; run setup_from_zero.ps1 after clone)
├── backend/                          # NestJS REST API
│   └── src/
│       ├── auth/                     # Auth, JWT, MFA, Super Admin management
│       ├── doctor/                   # Doctor module (CRUD + toggle active)
│       ├── patient/                  # Patient module (CRUD + toggle active)
│       ├── nurse/                    # Nurse module (CRUD + toggle active)
│       └── main.ts
│
└── Front_End/CODE-REACT/             # React SPA
    └── src/
        ├── components/
        │   └── partials/sidebar/     # Navigation sidebar (with Super Admin section)
        ├── views/
        │   ├── auth/                 # Sign-in, lock-screen, MFA confirmation
        │   ├── super-admin/          # Dashboard, user-list, auditors, care-coordinators
        │   ├── dashboard/            # Doctor dashboard
        │   └── dashboard-pages/      # Patient and nurse dashboards
        ├── services/
        │   └── api.js                # Centralized API calls
        └── router/
            └── default-router.jsx    # Application routes
```

---

## 📸 Screenshots

> *Screenshots to be added upon final UI completion*

| Page | Description |
|---|---|
| 🔐 Login Page | Accessible sign-in with voice, face, and gesture options |
| 📊 Super Admin Dashboard | Global user management view |
| 👤 User List | Manage and toggle account status for all roles |
| 🩺 Doctor Dashboard | Patient monitoring with charts |
| 📋 Patient Form | Vital parameters entry interface |
| 🚨 Alert Module | Notifications and alert management |

---

## 👥 Team

<div align="center">

**Team CodeCraft**

</div>

| Name | Role |
|---|---|
| **Khalki Imen Allah** | Full Stack Developer — Super Admin Module, Authentication |
| **Kacem Trabelsi** | Full Stack Developer |
| **Khalil Hlila** | Full Stack Developer |
| **Rahma Ayed** | Full Stack Developer |
| **Ayoub Ben Mohamed** | Full Stack Developer |

> **Supervisor:** Mrs. Asma Ayari
> **Institution:** ESPRIT — École Supérieure Privée d'Ingénierie et de Technologies
> **Academic Year:** 2025/2026

---

## 🔮 Future Improvements

- [ ] React Native mobile application for patients
- [ ] IoT sensor integration for automatic vital parameter collection
- [ ] AI-based readmission risk prediction
- [ ] Teleconsultation module (video / real-time chat)
- [ ] Personalized PDF medical report generation
- [ ] Electronic prescription system
- [ ] Full internationalization (multi-language support)
- [ ] Integration with hospital information systems (HL7/FHIR)
- [ ] Extended accessibility: eye-tracking (gaze-based) navigation

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**MediFollow** — *Connecting Patients and Healthcare Professionals*

Built with ❤️ by Team **CodeCraft** — ESPRIT 2025/2026

</div>
