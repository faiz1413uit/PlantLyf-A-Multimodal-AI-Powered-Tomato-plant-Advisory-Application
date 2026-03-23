import io
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.models import load_model


BACKEND_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BACKEND_DIR.parent
MODEL_PATH = ROOT_DIR / "plantlyf" / "tomato_disease_new_model.keras"

CLASS_NAMES = [
    "Early_blight",
    "Healthy",
    "Late_blight",
    "Leaf Miner",
    "Magnesium Deficiency",
    "Nitrogen Deficiency",
    "Pottassium Deficiency",
    "Spotted Wilt Virus",
]


@lru_cache(maxsize=1)
def get_model():
    return load_model(str(MODEL_PATH))


def _preprocess_image(image: Image.Image, target_size=(380, 380)):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    array = np.array(image).astype("float32")
    array = np.expand_dims(array, axis=0)
    return preprocess_input(array)


def analyze_image_bytes(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    model = get_model()
    preds = model.predict(_preprocess_image(image), verbose=0)[0]

    if preds.ndim != 1:
        preds = preds.squeeze()

    best_idx = int(np.argmax(preds))
    best_label = CLASS_NAMES[best_idx] if best_idx < len(CLASS_NAMES) else f"class_{best_idx}"
    best_conf = float(preds[best_idx])

    top_indices = preds.argsort()[-3:][::-1]
    top3 = []
    for idx in top_indices:
        label = CLASS_NAMES[int(idx)] if int(idx) < len(CLASS_NAMES) else f"class_{int(idx)}"
        top3.append((label, float(preds[int(idx)])))

    return {
        "predicted_label": best_label,
        "confidence": best_conf,
        "top3": top3,
    }
