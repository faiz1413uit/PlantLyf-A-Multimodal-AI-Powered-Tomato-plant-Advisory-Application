from typing import List, Optional

from pydantic import BaseModel, Field


class ChatHistoryItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)
    history: List[ChatHistoryItem] = Field(default_factory=list)
    city: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    disease_context: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    used_realtime: bool
    realtime: Optional[dict] = None


class DiseaseResponse(BaseModel):
    predicted_label: str
    confidence: float
    top3: List[tuple[str, float]]
