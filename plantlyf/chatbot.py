import os
import streamlit as st
from dotenv import load_dotenv
from PIL import Image

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq

from streamlit_geolocation import streamlit_geolocation
from weather import get_all_realtime_factors
from disease_model import analyze_uploaded_image

# ---------------- LOAD ENV ----------------
load_dotenv()
DB_FAISS_PATH = "vectorstore/db_faiss"

# ---------------- VECTORSTORE ----------------
@st.cache_resource
def get_vectorstore():
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return FAISS.load_local(
        DB_FAISS_PATH,
        embedding_model,
        allow_dangerous_deserialization=True
    )

# ---------------- HELPERS ----------------
def remove_large_headings(text: str) -> str:
    import re
    return re.sub(r'^#{1,6}\s+(.+)$', r'**\1**', text, flags=re.MULTILINE)

def is_refusal_answer(answer: str) -> bool:
    a = answer.lower()
    return (
        "i'm specialized in tomato plant care" in a
        and "is there something about tomatoes" in a
    )

def has_valid_realtime_data(realtime: dict | None) -> bool:
    if not realtime:
        return False

    important_fields = [
        "temperature",
        "humidity",
        "wind_speed",
        "soil_moisture",
        "soil_temperature",
        "rain_1h",
        "evapotranspiration"
    ]

    return any(realtime.get(k) is not None for k in important_fields)

# ---------------- BUILD CHAIN ----------------
def build_chain(vectorstore, realtime: dict | None):

    use_realtime = has_valid_realtime_data(realtime)

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

1. Structure the answer according to the user's question:
   - If about growing → provide step-by-step growing guide.
   - If about pests → provide prevention and control steps.
   - If about watering → provide irrigation guidance.
   - If about disease → explain symptoms and solutions.

2. Integrate environmental conditions only when they materially influence plant growth or management decisions.

   - Mention current numeric values when they change or refine the recommendation.
   - Do NOT insert environmental references into steps where they are irrelevant.
   - Avoid artificial or forced personalization.
   - Ensure each weather mention has a clear biological justification.

   Example:
   - If current temperature is 18°C, mention it when discussing planting.
   - If soil moisture is moderate, adjust watering advice.
   - If humidity is high, mention fungal risk.
   - If no recent rainfall, adjust irrigation frequency.

3. The response must feel personalized to the current weather.
   It should not sound like generic textbook advice.

4. Only mention environmental data when it meaningfully affects a recommendation.

==================================================
STYLE REQUIREMENTS
==================================================
- Use clear section headings when helpful.
- Use bullet points for clarity.
- Use **bold** only for section titles.
- Do NOT mention APIs, datasets, or internal systems.
- Do NOT say "based on environmental analysis".
- Keep tone practical and professional.

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
            max_tokens=800,
            api_key=os.environ.get("GROQ_API_KEY"),
        )
        | StrOutputParser()
    )

    return rag_chain, retriever, use_realtime

# ---------------- STREAMLIT APP ----------------
def main():
    st.title("🍅 Tomato Plant Care Chatbot")

    # ---------------- INIT SESSION STATE ----------------
    if "messages" not in st.session_state:
        st.session_state.messages = []

    if "realtime" not in st.session_state:
        st.session_state.realtime = None

    if "weather_loaded" not in st.session_state:
        st.session_state.weather_loaded = False

    # Store disease prediction across turns once an image is uploaded
    if "disease_result" not in st.session_state:
        st.session_state.disease_result = None
    # Track current uploaded file metadata and whether to ignore its context
    if "uploaded_file_meta" not in st.session_state:
        st.session_state.uploaded_file_meta = None
    if "ignore_uploaded_image" not in st.session_state:
        st.session_state.ignore_uploaded_image = False
    # Key to fully reset the file_uploader widget when clearing context
    if "image_uploader_key" not in st.session_state:
        st.session_state.image_uploader_key = 0

    # ---------------- SIDEBAR ----------------
    st.sidebar.header("📍 Location")

    gps_location = streamlit_geolocation()

    city = st.sidebar.selectbox(
        "Select city (fallback)",
        [
            "Lucknow", "Varanasi", "Prayagraj", "Agra",
            "Meerut", "Ghaziabad", "Noida", "Gorakhpur",
            "Bareilly", "Jhansi"
        ],
        index=0
    )

    # ---------------- FETCH WEATHER ON PAGE LOAD ----------------
    if not st.session_state.weather_loaded:

        with st.spinner("Fetching current environmental data..."):

            if (
                gps_location
                and gps_location.get("latitude") is not None
                and gps_location.get("longitude") is not None
            ):
                st.session_state.realtime = get_all_realtime_factors(
                    lat=gps_location["latitude"],
                    lon=gps_location["longitude"]
                )
            else:
                st.session_state.realtime = get_all_realtime_factors(
                    location_name=city
                )

        st.session_state.weather_loaded = True

    realtime = st.session_state.realtime

    # ---------------- SHOW CURRENT LOCATION + REFRESH ----------------
    if realtime:
        col1, col2 = st.sidebar.columns([3, 1])

        with col1:
            st.markdown(f"**📍 {realtime.get('location')}**")

        with col2:
            if st.button("🔄"):
                st.session_state.weather_loaded = False
                st.rerun()

    # ---------------- IMAGE UPLOAD (OPTIONAL, ALWAYS IN SIDEBAR) ----------------
    st.sidebar.header("🍃 Tomato leaf image")
    uploaded_file = st.sidebar.file_uploader(
        "Upload leaf image (JPG/PNG)",
        type=["jpg", "jpeg", "png"],
        key=f"leaf_uploader_{st.session_state.image_uploader_key}",
    )

    # Detect if a new file has been selected; if so, start considering it again
    if uploaded_file is not None:
        current_meta = (uploaded_file.name, getattr(uploaded_file, "size", None))
        if current_meta != st.session_state.uploaded_file_meta:
            st.session_state.uploaded_file_meta = current_meta
            st.session_state.ignore_uploaded_image = False

    # If user uploads a new image this run and we're not ignoring it, run the classifier
    if uploaded_file is not None and not st.session_state.ignore_uploaded_image:
        try:
            image = Image.open(uploaded_file).convert("RGB")
            st.sidebar.image(image, caption="Uploaded leaf image", use_container_width=True)

            disease_result = analyze_uploaded_image(uploaded_file)
            st.session_state.disease_result = disease_result
        except Exception as e:
            st.sidebar.warning(f"Could not analyze image: {e}")
            st.session_state.disease_result = None

    disease_result = st.session_state.disease_result

    if disease_result:
        st.sidebar.markdown("**Image-based disease analysis**")
        st.sidebar.write(
            f"- Predicted: `{disease_result['predicted_label']}` "
            # f"(confidence: {disease_result['confidence']:.2f})"
        )
        # if disease_result.get("top3"):
        #     st.sidebar.write("- Top candidates:")
        #     for label, prob in disease_result["top3"]:
        #         st.sidebar.write(f"  • {label}: {prob:.2f}")

        # Button to clear the current image/disease context
        if st.sidebar.button("Clear image"):
            st.session_state.disease_result = None
            st.session_state.ignore_uploaded_image = True
            st.session_state.uploaded_file_meta = None
            disease_result = None
            # Bump key so the uploader resets (removes selected file and preview)
            st.session_state.image_uploader_key += 1
            st.rerun()

    # ---------------- DISPLAY CHAT HISTORY ----------------
    for msg in st.session_state.messages:
        st.chat_message(msg["role"]).markdown(msg["content"])

    # ---------------- USER INPUT ----------------
    user_query = st.chat_input("Ask about tomato plant care")

    if user_query:

        st.chat_message("user").markdown(user_query)
        st.session_state.messages.append(
            {"role": "user", "content": user_query}
        )

        # Combine text question with image-based prediction (if available)
        final_query = user_query
        if disease_result is not None:
            lines = [
                "The user has also provided a tomato leaf image.",
                f"The disease classification model predicts: {disease_result['predicted_label']} "
                # f"with confidence {disease_result['confidence']:.2f}.",
            ]
            # if disease_result.get("top3"):
            #     top3_str = "; ".join(
            #         f"{label} ({prob:.2f})" for label, prob in disease_result["top3"]
            #     )
            #     lines.append(f"Top alternative candidates from the model are: {top3_str}.")

            image_context = "\n".join(lines)
            final_query = (
                user_query
                + "\n\nAdditional context from an image-based disease classifier:\n"
                + image_context
            )

        try:
            vectorstore = get_vectorstore()

            # Use stored weather instantly (NO WAITING)
            rag_chain, retriever, used_realtime = build_chain(
                vectorstore, realtime
            )

            answer = rag_chain.invoke(final_query)
            answer = remove_large_headings(answer)

            # Compose assistant message: first disease output (if any), then chatbot answer
            if disease_result is not None:
                disease_md_lines = [
                    "**Image-based disease analysis**",
                    f"- Predicted: `{disease_result['predicted_label']}` "
                    # f"(confidence: {disease_result['confidence']:.2f})",
                ]
                # if disease_result.get("top3"):
                #     disease_md_lines.append("- Top candidates:")
                #     for label, prob in disease_result["top3"]:
                #         disease_md_lines.append(f"  • {label}: {prob:.2f}")

                disease_md = "\n".join(disease_md_lines)
                combined_answer = disease_md + "\n\n" + answer
            else:
                combined_answer = answer

            st.chat_message("assistant").markdown(combined_answer)
            st.session_state.messages.append(
                {"role": "assistant", "content": combined_answer}
            )

            if not is_refusal_answer(answer):
                with st.expander("📄 Source Documents"):
                    docs = retriever.invoke(final_query)
                    for i, d in enumerate(docs, 1):
                        st.markdown(f"**Source {i}**")
                        st.write(d.page_content[:400] + "…")

            if used_realtime and realtime:
                with st.expander("🌦️ Environmental Conditions Used"):
                    for k, v in realtime.items():
                        st.write(f"**{k.replace('_',' ').title()}**: {v}")

        except Exception as e:
            st.error(str(e))


if __name__ == "__main__":
    main()
