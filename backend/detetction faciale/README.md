# Détection d’émotions (FER / visioconférence MediFollow)

## Intégration application

En **production**, la visioconférence (`VoiceCallLayer`) utilise **face-api.js** (`faceExpressionNet` + `tinyFaceDetector`) dans le navigateur : mêmes 7 classes que FER (neutral, happy, sad, angry, fearful, disgusted, surprised). Aucun envoi vidéo au serveur pour cette analyse.

## Entraîner votre propre modèle (optionnel)

### Python et TensorFlow (erreur « No matching distribution found for tensorflow »)

TensorFlow fournit des paquets **pip** surtout pour **Python 3.9 à 3.12** (64 bits). Avec **Python 3.13+**, `pip` peut afficher **`versions: none`** : aucun wheel n’existe pour ta version.

**À faire :**

1. Vérifie ta version : `python --version`  
   Si c’est **3.13 ou 3.14**, TensorFlow ne s’installera pas : il faut **Python 3.11 ou 3.12 (64 bits)** en parallèle (sans désinstaller 3.14).

2. **Installer Python 3.11** (au choix) :
   - **winget** (Windows 10/11, PowerShell ou CMD en administrateur si besoin) :  
     `winget install Python.Python.3.11 --accept-package-agreements`
   - Ou téléchargeur : [Python 3.11.x Windows x86-64](https://www.python.org/downloads/release/python-3119/) — coche **« Add python.exe to PATH »** et **« py launcher »**.

3. **Ferme toutes les fenêtres PowerShell** puis rouvre-en une (pour ne plus avoir un ancien `(.venv)` cassé).

4. Recrée le venv avec **3.11** :

```powershell
cd "C:\Users\MSI\Desktop\medifollow_main\backend\detetction faciale"
Remove-Item -Recurse -Force .venv -ErrorAction SilentlyContinue
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python --version
python -m pip install --upgrade pip
pip install -r requirements-train.txt
```

`python --version` doit afficher **3.11.x**. Si `py -3.11` est introuvable après l’installation, redémarre le PC ou utilise le chemin complet, par exemple :  
`& "$env:LocalAppData\Programs\Python\Python311\python.exe" -m venv .venv`

### Où est le `.csv` ?

Certaines versions du jeu [FER sur Kaggle](https://www.kaggle.com/datasets/msambare/fer2013) ne contiennent **pas** de fichier `fer2013.csv`, seulement des dossiers **`train/`** et **`test/`** avec des images classées par sous-dossier (une classe par dossier). **C’est normal** : dans ce cas il n’y a pas de CSV à chercher.

### Option A — Archive avec seulement `train/` et `test/` (votre cas)

1. Décompressez le ZIP (vous obtenez un dossier parent qui contient `train` et `test`).
2. Ouvrez `train` : vous devez voir **7 sous-dossiers** (souvent nommés `0` … `6`, ou `angry`, `happy`, etc.).
3. Lancez l’entraînement en pointant vers le **dossier parent** (celui qui contient `train`, pas `train` lui-même).

Exemple depuis `backend\detetction faciale` (PowerShell), si **`train`** et **`test`** sont directement sous **`archive`** :

```powershell
python train_emotion_model.py --from-dir ".\archive" --epochs 40
```

Si vous avez suivi la structure **`archive\fer2013_data\train`** et **`archive\fer2013_data\test`** :

```powershell
python train_emotion_model.py --from-dir ".\archive\fer2013_data" --epochs 40
```

Chemin absolu équivalent (à adapter si votre utilisateur ou disque diffère) :

```powershell
python train_emotion_model.py --from-dir "C:\Users\MSI\Desktop\medifollow_main\backend\detetction faciale\archive" --epochs 40
```

Le script lit toutes les images `.png` / `.jpg` dans chaque sous-dossier de classe.

### Option B — Fichier `fer2013.csv`

Si vous avez bien un fichier **`fer2013.csv`** (colonnes `emotion`, `pixels`), placez-le dans `backend/detetction faciale/fer2013.csv` puis :

```bash
cd backend/detetction faciale
pip install -r requirements-train.txt
python train_emotion_model.py --epochs 40
```

Le fichier **`emotion_model.keras`** est produit à la racine de ce dossier.

### Intégration visioconférence (TensorFlow.js)

L’app React charge automatiquement le modèle converti depuis  
`Front_End/CODE-REACT/public/emotion-model/model.json` (voir `src/services/face-emotions.js`).  
Si ce fichier est absent, la détection utilise **face-api.js** en secours.

**Export automatique (PowerShell)** depuis ce dossier :

```powershell
.\export_to_tfjs.ps1
```

**Ou manuellement** (Keras 3 : le `.keras` n’est pas du HDF5 ; il faut passer par un SavedModel, puis un **graph model** pour le navigateur) :

```powershell
pip install "tensorflowjs==3.18.0" "tensorflow-hub>=0.16.0"
python -c "import tensorflow as tf; tf.keras.models.load_model('emotion_model.keras').export('saved_model_emotion')"
tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model --signature_name=serving_default saved_model_emotion tfjs_out
```

Puis copiez tout le contenu de `tfjs_out` (`model.json` + `group*-shard*.bin`) dans  
`Front_End/CODE-REACT/public/emotion-model/`. Le front tente `loadLayersModel` puis `loadGraphModel` sur `model.json`.

Relancez `npm run dev` : lors d’un appel vidéo patient ↔ médecin / infirmier, l’émotion du patient est inférée avec **votre modèle** (recadrage visage + réseau 48×48).

## Guide pas à pas (Windows) — dossier `archive`

Le dossier **`archive`** contient pour l’instant surtout le notebook. Pour entraîner, il vous faut aussi les **données** : les dossiers **`train`** et **`test`** (téléchargés depuis Kaggle, voir plus haut).

### Étape 1 — Placer les données à côté du notebook

1. Téléchargez le jeu [msambare/fer2013](https://www.kaggle.com/datasets/msambare/fer2013) (ZIP) et décompressez-le.
2. Dans le dossier décompressé, vous devez voir **`train`** et **`test`** (chacun avec 7 sous-dossiers de classes).
3. **Copiez** ces deux dossiers **`train`** et **`test`** dans le projet, par exemple :

   `backend\detetction faciale\archive\fer2013_data\train`  
   `backend\detetction faciale\archive\fer2013_data\test`

   (Créez le dossier `fer2013_data` si besoin : il doit contenir **directement** `train` et `test`. Ne mettez pas `train` seul sans le parent.)

### Étape 2 — Ouvrir PowerShell et aller dans le bon répertoire

```powershell
cd "C:\Users\MSI\Desktop\medifollow_main\backend\detetction faciale"
```

### Étape 3 — (Recommandé) environnement virtuel Python

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Si l’activation est refusée : `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` puis réessayez.

### Étape 4 — Installer les dépendances d’entraînement

```powershell
pip install -r requirements-train.txt
```

### Étape 5 — Lancer l’entraînement

Le chemin passé à **`--from-dir`** est le dossier **parent** de `train` et `test` :

- Données dans **`archive\fer2013_data`** :

```powershell
python train_emotion_model.py --from-dir ".\archive\fer2013_data" --epochs 40
```

- Données **directement** sous **`archive`** (`archive\train`, `archive\test`) :

```powershell
python train_emotion_model.py --from-dir ".\archive" --epochs 40
```

À la fin, le fichier **`emotion_model.keras`** est créé dans :

`backend\detetction faciale\emotion_model.keras`

### Si quelque chose échoue

- **`Aucune image trouvée`** : vérifiez que `archive\fer2013_data\train` contient bien des sous-dossiers (0–6 ou noms d’émotions) avec des `.png` / `.jpg`.
- **`Dossier inconnu`** : les noms des sous-dossiers doivent être `0`…`6` ou `angry`, `happy`, `sad`, `neutral`, `surprise`, `fear`, `disgust` (voir le script).

## Notebook

Le notebook `archive/dl-project-face-emotions-recognition.ipynb` peut servir d’exploration ; le script `train_emotion_model.py` est la voie reproductible pour l’équipe.
