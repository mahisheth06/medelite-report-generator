# MedElite Facility Assessment Report Generator

A full-stack web application for looking up skilled nursing facilities by CMS Certification Number (CCN), combining public CMS data with internal operational notes, and exporting a branded PDF assessment report; *built as a technical assessment for Medelite.*

---

## 🔗 Live Application

| | |
|---|---|
| **Frontend** | [medelite-report-generator.vercel.app](https://medelite-report-generator-eight.vercel.app/) |
| **Backend API** | [medelite-report-generator.onrender.com](https://medelite-report-generator.onrender.com/) |

> **Note:** The backend runs on Render's free tier and may spin down after 15 minutes of inactivity. The first request can take 30–60 seconds to wake up — subsequent requests are instant.

---

## Overview

Healthcare operators need fast, consistent facility assessments; not manual data entry across multiple systems. This is solved by pulling live CMS data directly into a structured report, letting directors focus on the notes that matter rather than copy-pasting public records.

**Core flow:**
1. Enter a facility's CCN
2. App queries the CMS Provider Data Catalog API via a FastAPI backend proxy
3. Fields auto-populate: facility name, address, bed count, star ratings
4. Director fills in internal operational context (EMR, census, patient type, history)
5. One-click PDF export with branded header and clickable Medicare Care Compare link

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React 18, Vite, Tailwind CSS | Fast dev server, component-based UI, utility-first styling |
| Backend | Python, FastAPI, Uvicorn | Async-first, auto-generated docs, handles CORS proxy for CMS API |
| PDF Generation | jsPDF (client-side) | Instant browser downloads without a backend PDF endpoint |
| Data Source | CMS Provider Data Catalog API | Live, authoritative nursing facility data |
| Deployment | Vercel (frontend), Render (backend) | Zero-config CI/CD for both layers |

---

## Architecture

```
┌─────────────────────────────────────┐
│           React Frontend            │
│  (Vite + Tailwind CSS, Vercel)      │
│                                     │
│  CCN Input → API Call → Form Fill   │
│          → jsPDF Export             │
└──────────────┬──────────────────────┘
               │ HTTP (REST)
               ▼
┌─────────────────────────────────────┐
│         FastAPI Backend             │
│         (Uvicorn, Render)           │
│                                     │
│  /lookup?ccn=XXXXXX                 │
│  → CORS proxy to CMS API            │
│  → Returns structured facility JSON │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     CMS Provider Data Catalog API   │
│     (public, no auth required)      │
└─────────────────────────────────────┘
```

---

## Features

- **Live CCN lookup** — queries CMS Provider Data Catalog API in real time
- **Auto-populated fields** — facility name, address, bed count, and star ratings pulled directly from CMS data
- **Facility name override** — directors can override the CMS name if needed
- **Internal notes fields** — manual inputs for EMR system, census, patient type, and Medelite history
- **One-click PDF export** — client-side generation via jsPDF with branded header and clickable Medicare Care Compare link
- **Dynamic state abbreviation display**
- **Empty field handling** — unfilled fields render as dashes in the PDF output

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

---

## Testing

Use CCN `686123` (Kendall Lakes Healthcare and Rehab Center, Miami FL) to validate all data fields against the reference document.

---

## Design Decisions

**Why client-side PDF generation?**
Using jsPDF in the browser removes the need for a backend PDF endpoint entirely — no file storage, no server-side rendering dependencies, instant downloads. 

**Why a FastAPI proxy for the CMS API?**
Direct calls from the browser to the CMS API are blocked by CORS. The FastAPI backend acts as a lightweight proxy, keeping the frontend clean and making it easy to add caching or rate-limiting later.

**Why Vercel + Render?**
Zero-config deployments for both layers. Vercel handles the React build and CDN distribution automatically on push; Render handles the Python service. Faster shipping, less DevOps overhead.

---

## Project Structure

```
medelite-report-generator/
├── backend/
│   ├── app/
│   │   └── main.py          # FastAPI app, CMS proxy endpoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── README.md
```

---

## Author

**Mahi Sheth** — CS Student @ University of Cincinnati, AI Engineering Extern for Pfizer

[![Portfolio](https://img.shields.io/badge/Portfolio-ff69b4?style=flat-square&logo=github&logoColor=white)](https://mahisheth06.github.io/personalportfolio)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/mahisheth06/)
