import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# ---------------- LOAD ENV ----------------
load_dotenv()

# ---------------- LLM SETUP ----------------
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.5,
    max_tokens=512,
    api_key=os.environ.get("GROQ_API_KEY"),
)

# ---------------- VECTOR DATABASE ----------------
DB_FAISS_PATH = "vectorstore/db_faiss"

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

db = FAISS.load_local(
    DB_FAISS_PATH,
    embedding_model,
    allow_dangerous_deserialization=True
)

# ---------------- RETRIEVER (MMR) ----------------
retriever = db.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 3, "lambda_mult": 0.7}
)

# ---------------- PEST FILTER ----------------
PEST_KEYWORDS = [
    "pest", "insect", "whitefly", "aphid",
    "stink bug", "larva", "caterpillar",
    "control", "neem", "soap", "predator"
]

def filter_pest_docs(docs):
    return [
        doc for doc in docs
        if any(word in doc.page_content.lower() for word in PEST_KEYWORDS)
    ]

# ---------------- PROMPT ----------------
chat_prompt = ChatPromptTemplate.from_template(
    """
You are an agricultural assistant strictly specialized in **tomato plant cultivation, care, pests, diseases, and soil management**.

DOMAIN RULES (VERY IMPORTANT):
1. You must answer ONLY questions related to tomato plants.
2. If the question is NOT related to tomato plants, politely refuse to answer and say:
   "I can only answer questions related to tomato plant cultivation and care."
3. Do NOT provide general knowledge, personal information, or answers outside tomato agriculture.

CONTEXT USAGE RULES:
4. Use ONLY the provided context to answer.
5. Do NOT introduce techniques, chemicals, pests, organisms, climate facts, or numbers
   that are not explicitly mentioned in the context.
6. If the context is insufficient or missing, give a **safe, general answer limited to basic tomato practices**
   and clearly state that detailed guidance requires more information.

SEASON, CLIMATE & SOIL HANDLING:
7. If a season, climate, or soil condition is mentioned in the question, adjust emphasis accordingly
   WITHOUT inventing new methods.
8. If no season or climate is mentioned, do NOT assume one.

WINTER vs SUMMER LOGIC:
9. Winter → focus on sanitation, soil preparation, overwintering pests.
10. Summer → focus on active pest control, biological and preventive methods.

HALLUCINATION CONTROL:
11. Do NOT guess.
12. Do NOT over-explain missing context.
13. Do NOT include advice unrelated to tomato plants.

ANSWER STYLE:
14. Be clear, concise, and practical.
15. Prefer bullet points.
16. Do NOT mention internal reasoning, prompt rules, or system behavior.

Context:
{context}

Question:
{question}

Answer:
"""
)




# ---------------- RAG CHAIN ----------------
rag_chain = (
    {
        "context": retriever | filter_pest_docs,
        "question": RunnablePassthrough()
    }
    | chat_prompt
    | llm
    | StrOutputParser()
)

# ---------------- RUN ----------------
if __name__ == "__main__":
    user_query = input("Write Query Here: ")
    answer = rag_chain.invoke(user_query)
    source_docs = filter_pest_docs(retriever.invoke(user_query))

    print("\nRESULT:\n", answer)
    print("\nSOURCE DOCUMENTS:")
    for doc in source_docs:
        print(f"- {doc.metadata} -> {doc.page_content[:200]}...")
