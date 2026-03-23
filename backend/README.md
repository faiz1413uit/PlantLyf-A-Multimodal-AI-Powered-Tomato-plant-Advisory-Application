# PlantLyf FastAPI Backend

This backend exposes the PlantLyf chatbot and disease-analysis logic to the React frontend.

## Run

```powershell
cd "g:\React_Application\PlantAiAgent\backend"
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
```

Set real keys in `.env`:

```env
GROQ_API_KEY=...
OPENWEATHER_API_KEY=...
```

Then start API:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Health check:

```text
GET http://localhost:8000/api/health
```

## Endpoints

- `POST /api/chatbot` (alias: `/api/chat`)
- `POST /api/analyze-image` (multipart form field name: `file`)
- `GET /api/health`
