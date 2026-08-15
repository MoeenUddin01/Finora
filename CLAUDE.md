# Project Guidelines & Architecture - Finora

## Core Development Philosophy

### 🎯 Tracer Bullets Methodology (Pragmatic Programmer)
- Build end-to-end thin slices of functionality that span all layers of the system (Database → Models → CRUD → API Routers → Frontend UI) as early as possible.
- Validate architectural decisions and end-to-end data flows early with real execution feedback rather than building isolated, disconnected modules.

### 📝 Code Documentation Standard
- Always add clear Python **docstrings** to classes, functions, and key methods explaining their purpose, arguments, and return values.

---

## Technical Stack & Structure

- **Backend**: FastAPI (Python 3.12+), SQLAlchemy ORM 2.0, Pydantic v2, SQLite.
- **Frontend**: Vite + React, Tailwind CSS, Lucide Icons, Recharts.
- **Environment**: Managed using `uv` and Python virtual environment `.venv`.

---

## Helpful Commands

### Backend Commands (run from `backend/` directory)
- **Initialize & Seed DB**: `../.venv/bin/python -m app.seed`
- **Run FastAPI Dev Server**: `../.venv/bin/uvicorn app.main:app --reload`
- **Run Tests**: `../.venv/bin/pytest`

### Frontend Commands (run from `frontend/` directory)
- **Install Dependencies**: `npm install`
- **Run Dev Server**: `npm run dev`
- **Build Production Bundle**: `npm run build`
