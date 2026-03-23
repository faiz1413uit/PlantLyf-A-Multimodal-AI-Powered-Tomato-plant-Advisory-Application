import os
import sys
from functools import lru_cache
from pathlib import Path
from typing import Iterable

from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings


BACKEND_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BACKEND_DIR.parent
PLANTLYF_DIR = ROOT_DIR / "plantlyf"
DB_FAISS_PATH = PLANTLYF_DIR / "vectorstore" / "db_faiss"

if str(PLANTLYF_DIR) not in sys.path:
    sys.path.insert(0, str(PLANTLYF_DIR))

load_dotenv(PLANTLYF_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env")

from weather import get_all_realtime_factors  # noqa: E402


def _remove_large_headings(text: str) -> str:
    import re

    return re.sub(r"^#{1,6}\s+(.+)$", r"**\1**", text, flags=re.MULTILINE)


def _format_for_chat_display(text: str) -> str:
    import re

    if not text:
        return text

    normalized = text.replace("\r\n", "\n").strip()

    # Ensure numbered steps and bullet lines start on a new line.
    normalized = re.sub(r"\s+(\d+\.\s+)", r"\n\1", normalized)
    normalized = re.sub(r"\s+([*-]\s+)", r"\n\1", normalized)

    # Add spacing before common section headers for readability.
    normalized = re.sub(
        r"(?i)\s+(Symptoms|Causes|Management|Prevention|Treatment|Recommendations)\s*:",
        r"\n\n\1:",
        normalized,
    )

    # Collapse excessive blank lines while preserving intended spacing.
    normalized = re.sub(r"\n{3,}", r"\n\n", normalized)
    return normalized.strip()


def _has_valid_realtime_data(realtime: dict | None) -> bool:
    if not realtime:
        return False

    important_fields = [
        "temperature",
        "humidity",
        "wind_speed",
        "soil_moisture",
        "soil_temperature",
        "rain_1h",
        "evapotranspiration",
    ]
    return any(realtime.get(key) is not None for key in important_fields)


def _format_history(history: Iterable[dict]) -> str:
    lines = []
    for item in history:
        role = item.get("role", "user")
        content = (item.get("content") or "").strip()
        if not content:
            continue
        lines.append(f"{role}: {content}")
    return "\n".join(lines[-12:])


def _compose_query(question: str, history: list[dict], disease_context: str | None) -> str:
    history_block = _format_history(history)
    parts = []
    if history_block:
        parts.append(f"Conversation history:\n{history_block}")
    if disease_context:
        parts.append(f"Image-based disease context:\n{disease_context}")
    parts.append(f"User question:\n{question}")
    return "\n\n".join(parts)


def _build_chain(vectorstore, realtime: dict | None):
    use_realtime = _has_valid_realtime_data(realtime)

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    if use_realtime:
        realtime_section = f"""
Location: {realtime.get("location")}
Temperature: {realtime.get("temperature")} °C
Humidity: {realtime.get("humidity")} %
Wind Speed: {realtime.get("wind_speed")} m/s
Rainfall (1h): {realtime.get("rain_1h")} mm
Cloud Cover: {realtime.get("cloud_cover")} %
Soil Moisture: {realtime.get("soil_moisture")}
Soil Temperature: {realtime.get("soil_temperature")} °C
Evapotranspiration: {realtime.get("evapotranspiration")}
"""
    else:
        realtime_section = "Environmental data unavailable."

    template = """
You are a professional agricultural advisor specializing in tomato cultivation.

You are provided with real-time environmental conditions.
You MUST integrate them naturally into your response.

==================================================
DOMAIN RESTRICTION (MANDATORY)
==================================================

You may answer ONLY questions related to tomato plant care, including:
- Tomato planting and cultivation
- Irrigation and soil management
- Fertilization and nutrients
- Pest and disease management in tomatoes
- Pruning, staking, and harvesting

If the user asks anything unrelated to tomato plants,
you MUST NOT provide an answer.

Instead, respond exactly with:

"I'm specialized in tomato plant care and can only assist with tomato-related queries. Please ask a question related to tomato cultivation."

Do not add any extra explanation.
Do not partially answer.

==================================================
CURRENT ENVIRONMENTAL CONDITIONS
==================================================
{realtime_section}

These conditions reflect the user's current growing environment.
You MUST:

- Mention relevant current values (e.g., temperature, humidity, soil moisture)
  directly within your explanation when they influence advice.
- Adjust recommendations according to these specific values.
- Do NOT create a separate environmental analysis section.
- Do NOT classify factors as Favorable/Neutral/Unfavorable.

==================================================
KNOWLEDGE CONTEXT
==================================================
{context}

==================================================
RESPONSE INSTRUCTIONS
==================================================

1. Write a highly structured, explainable response in markdown-ready style.
2. Use this exact section flow (adapt content by query type):

   **Quick Summary**
   - 1-2 lines that directly answer the user's question.

   **Why This Is Happening**
   - Explain likely causes in simple agronomy terms.
   - If disease-related, mention symptom logic clearly.

   **What To Do Now (Next 24-48 Hours)**
   1. Immediate action 1
   2. Immediate action 2
   3. Immediate action 3

   **Action Plan (Next 7 Days)**
   - Day-wise or step-wise practical plan.

   **Monitoring Checklist**
   - What to observe daily and what indicates improvement/worsening.

   **Prevention For Future**
   - 3-5 concise preventive practices.

3. Integrate environmental conditions only when they materially influence decisions.
   - Mention concrete values (temperature, humidity, soil moisture, etc.) only where relevant.
   - Tie each important value to a recommendation (e.g., "Because temp is X, do Y").
4. If disease_context is present, prioritize diagnosis-linked care and mention confidence context when helpful.
5. Keep tone practical, professional, and farmer-friendly.
6. Keep each bullet actionable and specific (avoid generic advice).
7. Keep paragraphs short (1-3 lines max).

==================================================
USER QUESTION
==================================================
{question}

==================================================
FINAL ANSWER
==================================================
"""

    prompt = ChatPromptTemplate.from_template(template)
    rag_chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
        }
        | prompt.partial(realtime_section=realtime_section)
        | ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.2,
            max_tokens=1100,
            api_key=os.environ.get("GROQ_API_KEY"),
        )
        | StrOutputParser()
    )
    return rag_chain, use_realtime


@lru_cache(maxsize=1)
def get_vectorstore():
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return FAISS.load_local(
        str(DB_FAISS_PATH),
        embedding_model,
        allow_dangerous_deserialization=True,
    )


def _build_chat_payload(answer: str, used_realtime: bool, realtime: dict | None) -> dict:
    return {
        "answer": _format_for_chat_display(_remove_large_headings(answer)),
        "used_realtime": used_realtime,
        "realtime": realtime if used_realtime else None,
    }


def ask_chatbot(
    question: str,
    history: list[dict] | None = None,
    city: str | None = None,
    lat: float | None = None,
    lon: float | None = None,
    disease_context: str | None = None,
) -> dict:
    history = history or []
    realtime = get_all_realtime_factors(lat=lat, lon=lon, location_name=city)
    vectorstore = get_vectorstore()
    rag_chain, used_realtime = _build_chain(vectorstore, realtime)

    query = _compose_query(question=question, history=history, disease_context=disease_context)
    answer = rag_chain.invoke(query)

    return _build_chat_payload(answer=answer, used_realtime=used_realtime, realtime=realtime)


def stream_chatbot(
    question: str,
    history: list[dict] | None = None,
    city: str | None = None,
    lat: float | None = None,
    lon: float | None = None,
    disease_context: str | None = None,
) -> Iterable[dict]:
    history = history or []
    realtime = get_all_realtime_factors(lat=lat, lon=lon, location_name=city)
    vectorstore = get_vectorstore()
    rag_chain, used_realtime = _build_chain(vectorstore, realtime)

    query = _compose_query(question=question, history=history, disease_context=disease_context)
    chunks: list[str] = []

    for chunk in rag_chain.stream(query):
        text = str(chunk)
        if not text:
            continue
        chunks.append(text)
        yield {"type": "chunk", "content": text}

    final_payload = _build_chat_payload(
        answer="".join(chunks),
        used_realtime=used_realtime,
        realtime=realtime,
    )
    yield {"type": "done", **final_payload}
