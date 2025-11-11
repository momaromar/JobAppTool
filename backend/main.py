from typing import List, Optional

import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

try:
    # JobSpy public API typically exposes `scrape_jobs` returning a pandas DataFrame
    # https://github.com/jobspy/jobspy
    from jobspy import scrape_jobs  # type: ignore
except Exception:  # pragma: no cover - optional at runtime
    scrape_jobs = None  # type: ignore


app = FastAPI(title="JobAppTool Backend", version="0.1.0")


def _allowed_origins() -> List[str]:
    raw = os.getenv("ALLOW_ORIGINS", "http://localhost:3000")
    return [o.strip() for o in raw.split(",") if o.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/api/jobspy")
def api_jobspy(
    q: str = Query("", description="Search query/keywords"),
    site: str = Query("indeed", description="Comma-separated site names, e.g., indeed,glassdoor,linkedin"),
    location: str = Query("remote", description="Location or region"),
    limit: int = Query(50, ge=1, le=500, description="Number of results desired"),
    hours_old: Optional[int] = Query(None, ge=1, description="Max age of postings in hours"),
):
    """Run JobSpy for the requested sites and return normalized jobs.

    Response schema matches the frontend's normalizeJob fields so the React app can
    merge directly without additional mapping.
    """

    sites = [s.strip() for s in site.split(",") if s.strip()]

    if scrape_jobs is None:
        # Graceful fallback if JobSpy isn't installed in this environment
        return []

    try:
        # JobSpy returns a pandas DataFrame
        df = scrape_jobs(
            site_name=sites,
            search_term=q or None,
            location=location or None,
            results_wanted=limit,
            hours_old=hours_old,
        )

        # Convert to list of dicts
        records = df.to_dict(orient="records") if df is not None else []

        def norm(x: dict) -> dict:
            # Best-effort field extraction across boards; keys vary by site
            # Common JobSpy fields observed: title, company, location, job_url, date_posted,
            # description, is_remote/remote, job_type/type, salary_min, salary_max, currency, source
            title = x.get("title") or x.get("job_title")
            company = x.get("company") or x.get("company_name")
            job_url = x.get("job_url") or x.get("url")
            posted = x.get("date_posted") or x.get("posted_at") or x.get("date")
            job_type = x.get("job_type") or x.get("type")
            is_remote = bool(x.get("remote") or x.get("is_remote") or (x.get("location") and str(x.get("location")).lower().find("remote") >= 0))
            src = x.get("source") or (sites[0] if sites else "jobspy")

            # Build a stable-ish id
            ident = x.get("job_id") or x.get("id") or job_url or f"{title}:{company}:{src}"

            return {
                "id": f"jobspy:{src}:{ident}",
                "title": title,
                "company": company,
                "location": x.get("location") or ("Remote" if is_remote else "Unknown"),
                "remote": is_remote,
                "type": job_type or "Unknown",
                "salaryMin": x.get("salary_min"),
                "salaryMax": x.get("salary_max"),
                "currency": x.get("currency"),
                "source": src,
                "url": job_url or "#",
                "postedAt": posted,
                "description": x.get("description") or "",
                "tags": x.get("tags") or [],
            }

        return [norm(r) for r in records]
    except Exception:
        # Avoid leaking internal errors; return empty list to keep UI stable
        return []

