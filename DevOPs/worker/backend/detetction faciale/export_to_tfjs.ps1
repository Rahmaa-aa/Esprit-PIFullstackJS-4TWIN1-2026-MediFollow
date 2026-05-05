# Export emotion_model.keras -> TensorFlow.js (graph) dans le dossier public du front React
# Keras 3 (.keras) n'est pas lu comme HDF5 par tensorflowjs 3.x : on exporte d'abord en SavedModel.
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

Write-Host "Installation tensorflowjs + tensorflow-hub compatible TF 2.x (pip)..."
python -m pip install "tensorflowjs==3.18.0" "tensorflow-hub>=0.16.0"

$keras = Join-Path $here "emotion_model.keras"
if (-not (Test-Path $keras)) {
    Write-Error "Fichier introuvable : $keras (entrainez d'abord avec train_emotion_model.py)"
}

$saved = Join-Path $here "saved_model_emotion"
$out = Join-Path $here "tfjs_emotion_export"
if (Test-Path $saved) { Remove-Item -Recurse -Force $saved }
if (Test-Path $out) { Remove-Item -Recurse -Force $out }

Write-Host "Export Keras 3 -> SavedModel..."
python -c @"
import tensorflow as tf
m = tf.keras.models.load_model(r'$keras')
m.export(r'$saved')
print('SavedModel OK')
"@

Write-Host "Conversion SavedModel -> TensorFlow.js (graph model)..."
tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model --signature_name=serving_default $saved $out

$dest = Join-Path $here "..\..\Front_End\CODE-REACT\public\emotion-model"
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }
Copy-Item -Path (Join-Path $out "*") -Destination $dest -Recurse -Force

Write-Host "OK -> $dest"
Write-Host "Fichiers : model.json + group*-shard*.bin (le front charge ce format via loadGraphModel)."
