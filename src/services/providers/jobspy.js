// JobSpy provider (via backend FastAPI). CORS-friendly.

export async function fetchJobSpyJobs(query = '', opts = {}) {
  const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const params = new URLSearchParams({
    q: query || '',
    site: String(opts.site || 'indeed'),
    location: String(opts.location || 'remote'),
    limit: String(opts.limit || 50),
  });
  if (opts.hours_old) params.set('hours_old', String(opts.hours_old));

  const endpoint = `${base}/api/jobspy?${params.toString()}`;
  try {
    const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('JobSpy fetch failed');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

