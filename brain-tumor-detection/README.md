# Détection de tumeur cérébrale (IRM) — ResNet50

Pipeline d’entraînement et d’inférence pour le dataset Kaggle *Brain MRI Images for Brain Tumor Detection* (dossiers `yes` / `no`).

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

- `brain_tumor_resnet.h5` — modèle sauvegardé  
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
