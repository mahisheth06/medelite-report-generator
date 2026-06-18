# Medelite Facility Assessment Report Generator

A web application that allows Medelite directors to look up skilled nursing
facilities by CCN, combine public CMS data with internal operational notes,
and download a polished PDF assessment report.

## Live Application

- **Frontend:** [Coming in Phase 12]
- **Backend API:** [Coming in Phase 12]

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| PDF Generation | jsPDF (client-side) |
| Data Source | CMS Provider Data Catalog API |
| Deployment | Vercel (frontend), Render (backend) |

## Getting Started Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Test Case

Use CCN `686123` (Kendall Lakes Healthcare and Rehab Center, Miami FL)
to validate all data fields match the reference document.

## Engineering Assumptions

- PDF generation is handled client-side using jsPDF for instant browser downloads
- The INFINITE brand name is hardcoded and never replaced by facility data
- CMS API is queried via backend proxy to avoid browser CORS restrictions

## Author

Built as a technical assessment for Medelite.