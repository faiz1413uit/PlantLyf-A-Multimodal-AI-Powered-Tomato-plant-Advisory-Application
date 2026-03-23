import io
from typing import Dict, List, Tuple

import numpy as np
from PIL import Image
import streamlit as st
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input


@st.cache_resource
def load_disease_model(model_path: str = "tomato_disease_new_model.keras"):
    """
    Load and cache the tomato disease classification model.
    """
    return load_model(model_path)


# Global model handle for convenience
model = load_disease_model()


# Class names (must match training order)
CLASS_NAMES: List[str] = [
    "Early_blight",
    "Healthy",
    "Late_blight",
    "Leaf Miner",
    "Magnesium Deficiency",
    "Nitrogen Deficiency",
    "Pottassium Deficiency",
    "Spotted Wilt Virus",
]


def _preprocess_image(
    image: Image.Image,
    target_size: Tuple[int, int] = (380, 380),
) -> np.ndarray:
    """
    Resize to 380x380 RGB and apply EfficientNet preprocessing.
    """
    if image.mode != "RGB":
        image = image.convert("RGB")

    image = image.resize(target_size)
    array = np.array(image).astype("float32")
    array = np.expand_dims(array, axis=0)
    array = preprocess_input(array)
    return array


def predict_disease_from_pil(image: Image.Image) -> Dict:
    """
    Run disease prediction on a PIL image and return a structured result.
    """
    input_array = _preprocess_image(image)
    preds = model.predict(input_array, verbose=0)[0]

    if preds.ndim != 1:
        preds = preds.squeeze()

    best_idx = int(np.argmax(preds))
    best_conf = float(preds[best_idx])
    best_label = CLASS_NAMES[best_idx] if best_idx < len(CLASS_NAMES) else f"class_{best_idx}"

    top_indices = preds.argsort()[-3:][::-1]
    top3: List[Tuple[str, float]] = []
    for idx in top_indices:
        label = CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else f"class_{int(idx)}"
        top3.append((label, float(preds[idx])))

    return {
        "predicted_label": best_label,
        "confidence": best_conf,
        "top3": top3,
    }


def analyze_uploaded_image(file) -> Dict:
    """
    Convenience wrapper for Streamlit file_uploader output.
    Compatible with Streamlit's UploadedFile and generic file-like objects.
    """
    if hasattr(file, "getvalue"):
        image_bytes = file.getvalue()
    else:
        try:
            file.seek(0)
        except Exception:
            pass
        image_bytes = file.read()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return predict_disease_from_pil(image)

