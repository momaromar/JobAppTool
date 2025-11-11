# JobAppTool Backend (FastAPI + JobSpy)

This is a minimal FastAPI backend that wraps JobSpy to scrape jobs on demand and returns them in the format expected by the frontend.

## Run locally

- Create a virtualenv and install deps:
  - `python -m venv .venv && . .venv/bin/activate` (Linux/macOS)
  - `python -m venv .venv && .venv\\Scripts\\activate` (Windows)
  - `pip install -r requirements.txt`
- Start the server:
  - `uvicorn main:app --reload --port 8000`
- CORS: By default allows `http://localhost:3000`. Override with env var:
  - `ALLOW_ORIGINS="http://localhost:3000,http://127.0.0.1:3000" uvicorn main:app --reload`

## Endpoint

- `GET /api/jobspy`
  - Query params:
    - `q` search keywords (string)
    - `site` comma-separated site names, e.g. `indeed,glassdoor,linkedin`
    - `location` e.g. `remote`, `United States`, `Berlin`
    - `limit` number of results (1-500)
    - `hours_old` posted within X hours (optional)
  - Returns: array of normalized job objects compatible with the frontend.

## Notes

- JobSpy may require browser automation for some sources (e.g., Playwright/Chromium). Extend the Dockerfile to install necessary browsers/drivers if needed.
- In production, deploy this backend to a host (e.g., Cloud Run/Render/Railway) and set `REACT_APP_API_BASE_URL` in the frontend to point to it.

