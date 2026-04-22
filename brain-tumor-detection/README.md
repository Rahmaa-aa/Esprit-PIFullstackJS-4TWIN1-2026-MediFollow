# Détection de tumeur cérébrale (IRM) — ResNet50

Pipeline d’entraînement et d’inférence pour le dataset Kaggle *Brain MRI Images for Brain Tumor Detection* (dossiers `yes` / `no`).

## Démarrage depuis zéro (nouveau PC / clone Git)

Ce dossier **doit** exister à la racine du dépôt : `MediFollow/brain-tumor-detection/`.  
Les **fichiers modèle** (`.keras` / `.h5`) ne sont **pas** versionnés : chaque machine doit les générer ou les copier.

### Windows (recommandé)

```powershell
cd brain-tumor-detection
.\Install-BrainTumorEnv.ps1
```

Si une erreur **Pester** apparaît (*The Setup command may only be used inside a Describe block*), le module Pester entre en conflit avec le script. Utilisez :

```powershell
powershell -NoProfile -File .\Install-BrainTumorEnv.ps1
```

(`setup_from_zero.ps1` lance `Install-BrainTumorEnv.ps1` dans un **PowerShell sans profil** pour éviter Pester.)

**Encodage :** sous Windows, les scripts `.ps1` doivent rester **ASCII** dans les chaînes affichées (pas de tiret long « — » ni caractères UTF-8 hors BOM) ; sinon PowerShell 5.1 peut couper les guillemets et afficher *installation* introuvable.

### Windows — TensorFlow / erreur « No such file or directory » (chemins longs)

TensorFlow contient des fichiers avec des chemins **très longs**. Par défaut, Windows limite un chemin complet à **260 caractères** : `pip` peut échouer au milieu de l’installation (`client_side_weighted_round_robin...upb.h`), puis Python affiche `No module named 'tensorflow.python'`.

**Correctif recommandé (une fois, en administrateur) :**

1. Ouvrir **PowerShell en administrateur** et exécuter :

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

2. **Redémarrer** le PC (ou au minimum fermer toutes les sessions / rouvrir le terminal).

3. Dans `brain-tumor-detection`, **supprimer** le dossier `.venv` (installation cassée).

4. Relancer `Install-BrainTumorEnv.ps1`.

**Alternative :** cloner le dépôt vers un chemin **court**, par ex. `C:\dev\MediFollow`, pour réduire la longueur totale.

Documentation Microsoft : [Maximum path length limitation](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation).

### Linux / macOS

```bash
cd brain-tumor-detection
chmod +x setup_from_zero.sh
./setup_from_zero.sh
```

Le script crée `.venv`, installe TensorFlow, puis lance **`build_stub_brain_model.py`** pour produire `brain_tumor_resnet.keras` (sans dataset — pour faire fonctionner l’API). Ensuite : relancer le backend NestJS (`cd ../backend` → `npm run start:dev`).

Détails manuels : voir section *Après un `git clone`* ci-dessous.

## Prérequis

- **Python 3.11 ou 3.12** (obligatoire pour TensorFlow : **pas de wheel pour Python 3.14** pour l’instant).  
- Sous Windows, si `python` pointe vers 3.14, utilisez le lanceur : `py -3.12` ou un venv créé avec 3.12.
- Dépendances : `pip install -r requirements.txt` (de préférence dans un venv).

### Installation rapide (Windows)

```powershell
cd brain-tumor-detection
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Ou : `.\setup_env.ps1` (crée `.venv` avec `py -3.12` si disponible).

## Après un `git clone` — fichier modèle manquant

Les fichiers `brain_tumor_resnet.keras` / `.h5` **ne sont pas dans le dépôt** (`.gitignore`, fichiers lourds). Sans eux, l’API NestJS affiche *Modèle introuvable*.

**Option A — Rapide (sans dataset, pour tester la stack)** : génère un `.keras` avec la même architecture que l’entraînement (ResNet50 ImageNet + tête non entraînée sur vos IRM). Les prédictions ne sont **pas** cliniquement fiables.

```powershell
cd brain-tumor-detection
.\.venv\Scripts\Activate.ps1   # ou votre venv Python 3.11/3.12
pip install -r requirements.txt
python build_stub_brain_model.py
```

La première fois, TensorFlow peut télécharger les poids ImageNet (~100 Mo). Ensuite relancez le backend.

**Option B — Production** : entraînez avec un vrai dataset (`yes` / `no`), voir section *Entraînement* ci-dessous.

**Option C** : copiez un fichier `.keras` ou `.h5` depuis un collègue et placez-le dans `brain-tumor-detection/`, ou définissez `BRAIN_TUMOR_MODEL` dans `backend/.env` avec le chemin absolu vers ce fichier.

## Dataset

Deux formes acceptées :

**A — Kaggle à la racine**

```
dataset/
  yes/
  no/
```

**B — Sous-dossier (ex. téléchargement décompressé)**

```
dataset/
  brain_tumor_dataset/
    yes/
    no/
```

Passez `--data_root` au dossier parent (`dataset`) : le script détecte automatiquement `brain_tumor_dataset/yes` et `brain_tumor_dataset/no`.

## Entraînement

```bash
# Windows PowerShell (exemple)
$env:BRAIN_MRI_DATA_ROOT="C:\Users\...\Downloads\dataset"
python train_brain_tumor.py
```

Ou avec argument :

```bash
python train_brain_tumor.py --data_root "C:\chemin\vers\dataset"
```

Sorties :

- `brain_tumor_resnet.keras` — modèle (format recommandé)  
- `brain_tumor_resnet.h5` — ancien format si utilisé  
- `training_history.png` — courbes loss / accuracy (train & validation)

Paramètres par défaut : 10 epochs, batch 16, split 70 % / 15 % / 15 %, ResNet50 ImageNet gelé + couche dense sigmoid.

## Prédiction (CLI, utilisée par l’API MediFollow)

```bash
python brain_tumor_predict_cli.py chemin\vers\image.png
```

Variable optionnelle : `BRAIN_TUMOR_MODEL` (chemin du fichier `.h5`).

## Intégration backend NestJS

Lancez l’API depuis le dossier **`backend/`** (`npm start`) : le service cherche `brain-tumor-detection` en `../brain-tumor-detection`, puis au besoin dans `./brain-tumor-detection` (si le cwd est la racine du dépôt).

Variables optionnelles dans `.env` du backend :

- `BRAIN_TUMOR_ROOT` — chemin absolu vers ce dossier (prioritaire)  
- `BRAIN_TUMOR_MODEL` — chemin du fichier modèle (`.keras` ou `.h5`) si différent du défaut dans `BRAIN_TUMOR_ROOT`  
- `BRAIN_TUMOR_PYTHON` — exécutable Python (ex. `.\.venv\Scripts\python.exe` sous Windows)  

Les images uploadées sont écrites dans un fichier temporaire avec la **bonne extension** (JPEG/PNG/…) pour éviter les erreurs OpenCV.

## Environnement Python (Windows, recommandé)

```powershell
cd brain-tumor-detection
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Ne pas** mettre un chemin absolu perso (`C:/Users/...`) dans un fichier partagé : après un `git clone`, ce chemin n’existe pas chez les autres.

- **Recommandé :** ne pas définir `BRAIN_TUMOR_PYTHON` dans le `.env` local. Tant que le venv existe sous `brain-tumor-detection/.venv`, l’API NestJS l’utilise automatiquement.
- **Optionnel :** `BRAIN_TUMOR_PYTHON=.venv/Scripts/python.exe` (relatif au dossier `brain-tumor-detection`, portable pour toute l’équipe sur la même structure de repo).

## Notebook

Ouvrir `brain_tumor_mri.ipynb` dans Jupyter : la cellule d’entraînement appelle `train_brain_tumor.py` (répertoire courant = ce dossier).
