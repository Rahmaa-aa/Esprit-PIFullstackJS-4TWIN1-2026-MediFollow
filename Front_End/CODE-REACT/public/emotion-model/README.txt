Modèle TensorFlow.js (émotions FER) — généré depuis emotion_model.keras

1) Depuis backend\detetction faciale (venv avec tensorflowjs) :

   pip install tensorflowjs
   tensorflowjs_converter --input_format=keras emotion_model.keras tfjs_out

2) Copiez le CONTENU de tfjs_out ici (fichiers model.json + shards .bin), pour obtenir :

   public/emotion-model/model.json
   public/emotion-model/*.bin

3) Relancez le front (npm run dev). L’app charge ce modèle pour la visio ; si model.json est absent, elle utilise face-api.js en secours.

Optionnel : VITE_EMOTION_MODEL_URL=https://.../model.json pour héberger le modèle ailleurs.
