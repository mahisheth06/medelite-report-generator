# Medelite Facility Assessment Report Generator

A web application that allows Medelite directors to look up skilled nursing
facilities by CCN (CMS Certification Number), combine public CMS data with
internal operational notes, and download a polished PDF assessment report.

## Live Application

- **Frontend:** https://medelite-report-generator.vercel.app
- **Backend API:** https://medelite-report-generator.onrender.com/
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
source venv/bin/activate
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

## Features

- Dynamic CCN lookup via CMS Provider Data Catalog API
- Auto-populates facility name, address, bed count, and star ratings
- Optional facility name override field
- Manual input fields for EMR, census, patient type, and Medelite history
- One-click PDF download with clickable Medicare Care Compare hyperlink
- INFINITE / Medelite branding header on both UI and PDF
- Dynamic state abbreviation display

## Test Case

Use CCN `686123` (Kendall Lakes Healthcare and Rehab Center, Miami FL)
to validate all data fields match the reference document.

## Engineering Assumptions

- PDF generation is handled client-side using jsPDF for instant browser
  downloads without requiring a backend PDF endpoint
- The INFINITE brand name is hardcoded static text and is never replaced
  by facility data per the assignment branding guardrail
- CMS API is queried via a FastAPI backend proxy to avoid browser CORS
  restrictions on direct API calls from the frontend
- Empty manual input fields render as dashes in the PDF output

> **Note:** The backend is hosted on Render's free tier which may 
> spins down after 15 minutes of inactivity. The first request 
> may take 30-60 seconds to wake up. Subsequent requests are instant.

## Author
Built as a technical assessment for Medelite.