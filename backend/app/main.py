import json
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.schemas import ChatRequest, ChatResponse, DiseaseResponse
from app.services.chat_service import ask_chatbot, stream_chatbot
from app.services.disease_service import MODEL_PATH, analyze_image_bytes


app = FastAPI(title="PlantLyf API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    base_dir = Path(__file__).resolve().parents[2]
    vectorstore_dir = base_dir / "plantlyf" / "vectorstore" / "db_faiss"
    model_exists = MODEL_PATH.exists()
    vectorstore_exists = (vectorstore_dir / "index.faiss").exists() and (
        vectorstore_dir / "index.pkl"
    ).exists()

    return {
        "status": "ok",
        "model_exists": model_exists,
        "vectorstore_exists": vectorstore_exists,
    }


@app.post("/api/chatbot", response_model=ChatResponse)
@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    try:
        result = ask_chatbot(
            question=payload.question,
            history=[h.model_dump() for h in payload.history],
            city=payload.city,
            lat=payload.lat,
            lon=payload.lon,
            disease_context=payload.disease_context,
        )
        return ChatResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/chatbot/stream")
@app.post("/api/chat/stream")
def chat_stream(payload: ChatRequest):
    def generate():
        try:
            for event in stream_chatbot(
                question=payload.question,
                history=[h.model_dump() for h in payload.history],
                city=payload.city,
                lat=payload.lat,
                lon=payload.lon,
                disease_context=payload.disease_context,
            ):
                yield json.dumps(event, ensure_ascii=False) + "\n"
        except Exception as exc:
            yield json.dumps({"type": "error", "detail": str(exc)}, ensure_ascii=False) + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@app.post("/api/analyze-image", response_model=DiseaseResponse)
async def analyze_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    try:
        image_bytes = await file.read()
        # Accept all image MIME types (jpg/png/webp/heic/etc) and rely on PIL/model parsing.
        if file.content_type and not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Please upload an image file")
        result = analyze_image_bytes(image_bytes)
        return DiseaseResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {exc}") from exc
