# AI Usage — MediFollow (PI Full-Stack / ESPRIT)

This document describes how **artificial intelligence** was used during the **MediFollow** project, with focus on **Cursor IDE** and the **agent / model families** selected in practice. It is intended for **academic transparency** (ESPIRIT Integrated Project).

---

## Introduction

Throughout development, **large language models** inside **Cursor** were used as **assistive** tools—for exploration, drafting, and faster iteration—while **requirements, security, integration testing, and final validation** remained the responsibility of **Team CodeCraft**. Outputs were always reviewed against running code, official documentation, and team review.

---

## AI Tools Used

| Tool | Role in MediFollow |
|------|---------------------|
| **Cursor IDE** | Main AI-assisted workspace: repository-wide search, multi-file edits, terminal commands, and **Agent** sessions for end-to-end tasks (front + back). |
| **Cursor — Composer (fast agent)** | Used for **Composer** / fast agent flows to implement focused changes across several files with minimal friction (e.g. SCSS fixes, React components, NestJS wiring). |
| **Cursor — Claude Sonnet 4.6** | Used for **reasoning-heavy** refactors, structured explanations, and longer-context edits (e.g. Cloudinary module layout, accessibility fixes). |
| **Cursor — GPT-5.3** | Used for **implementation and debugging** sessions (TypeScript/NestJS/React), stack-trace interpretation, and command-line workflows. |
| **GitHub Copilot** *(optional)* | Occasional **inline completion** when editing outside Agent mode; not the primary workflow for this documentation thread. |

---

## Tasks Assisted by AI (MediFollow)

- **Code generation** — NestJS modules (e.g. file upload, profile image pipeline), React `LandingShell` / auth views, SCSS utility classes.
- **Debugging** — React runtime errors (`generatePath is not defined`), Cloudinary **403 / TLS** upload issues, dependency and path resolution.
- **Documentation & reports** — Markdown reports (`docs/rapport-accessibilite-wcag.md`, performance landing), PDF build scripts, **`IA_USAGE.md`** itself.
- **UI / accessibility** — WCAG-oriented tweaks (footer link distinguishable without colour alone, hospital landing CSS).
- **Git workflows** — Commit messages and **`git commit --author`** when a specific team identity was requested for traceability.
- **Optimization & DevOps hints** — Bundle/chunk discussion, Edge headless PDF generation, `npm` scripts for diagnostics.

---

## Realistic Prompt Examples *(from actual MediFollow sessions)*

Below are **paraphrased** prompts that match real requests made while working on this project with Cursor Agent (Composer / Sonnet / **GPT‑5.3**). Wording may differ slightly from verbatim chat history.

1. *“The **Connexion / Inscription** buttons on the landing page look **transparent** — fix it; we use `btn-primary-subtle` in `custom-style.scss`.”*

2. *“**Integrate Cloudinary** on the backend: module + service, **`POST /api/auth/me/profile-image`**, and make **patient** profile photos work with **`PUT /patients/:id`**; then doctors/nurses/admins via auth profile update.”*

3. *“Cloudinary **ping works** but **upload returns 403** — add retries, optional **IPv4** HTTPS agent, and a small **`npm run cloudinary:ping`** / test-upload script to diagnose.”*

4. *“**`/auth/lock-screen`** crashes with **`generatePath is not defined`** — fix imports/paths and the image URL for the admin photo.”*

5. *“**achecker.ca** reports WCAG **1.4.1**: `<a class="text-primary text-decoration-none" href="/">MediFollow</a>` — fix so the link is **not only distinguished by colour**.”*

6. *“The scan still shows the same issue — **reinforce** the footer link with a dedicated class and **CSS** in `public/hospital/css/style.css` under `.hospital-home`.”*

7. *“**NestJS** returns **401** on protected routes after sign-in — check **`JwtStrategy`** / **`Authorization: Bearer`** and that the React **`api.js`** (or `axios`) interceptor attaches the token on every request.”*

8. *“**CORS error** when the frontend calls the API from **`medifollow-frontend.vercel.app`** — update **`main.ts`** (`enableCors` origins) and confirm **`credentials`** if we use cookies; list exact env URLs for prod vs local.”*

9. *“**Doctor dashboard** patient list is empty for a valid doctor user — trace **`PatientService`** / department filters and verify the **`doctorUser` id** in `localStorage` matches how patients are linked in MongoDB.”*

---

## LLMs, Agents, and Models Used

| Layer | What we used |
|--------|----------------|
| **Cursor Agent** | Multi-step tasks: read files, patch code, run `npm run build`, `node docs/build-pdf-a11y.mjs`, `git` operations when requested. |
| **Composer (2 / fast agent)** | Fast iteration on UI and small cross-file fixes (SCSS, JSX, short NestJS edits). |
| **Claude Sonnet 4.6** | Larger edits and clearer rationale for structural changes (e.g. accessibility + CSS strategy). |
| **GPT‑5.3** | Debugging, backend/frontend glue, and procedural steps (scripts, env diagnostics). |

Exact **model labels** in the Cursor UI can change between product updates; the names above match the **families** selected during MediFollow development sessions.

**Important:** Automated suggestions were **never** merged blindly—**TypeScript compile**, **runtime checks**, and **manual verification** (e.g. achecker re-scan, Vercel deploy) decided what stayed in the repo.

---

## Reflection

AI **shortened feedback loops** (fewer blank-page moments, faster hypothesis testing on errors) and helped keep **documentation** aligned with what was actually implemented. Limitations remain: models can **hallucinate** APIs, miss **security** nuances (JWT, RBAC, PHI), or propose patterns that conflict with the existing **xray/Bootstrap** theme—so **human validation** is non-negotiable.

**Productivity** improved on **repetitive** and **exploratory** tasks; **architecture**, **compliance**, and **exam defense** still require deep **team** understanding. This document records AI assistance honestly; **accountability** for the Integrated Project deliverable rests with **Team CodeCraft** and ESPRIT academic rules.

---

**MediFollow** — Integrated Project (PI) · ESPRIT · Academic Year 2025/2026 · **Team CodeCraft**
