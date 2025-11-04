// RemoteOK provider (no key). Note: May be blocked by CORS in browsers.

import { normalizeJob } from '../aggregate';

export async function fetchRemoteOkJobs(query = '') {
  // Official JSON feed: https://remoteok.com/api
  // CORS policy may block in browser; keep optional.
  const endpoint = 'https://remoteok.com/api';
  try {
    const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('RemoteOK fetch failed');
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    // First element is metadata; jobs follow
    const jobs = data.slice(1).map(mapRemoteOkJob).filter(Boolean);
    return filterByQuery(jobs, query);
  } catch (e) {
    // Swallow errors; return empty to avoid crashing UI
    return [];
  }
}

function mapRemoteOkJob(item) {
  if (!item || !item.id) return null;
  return normalizeJob({
    id: `remoteok:${item.id}`,
    title: item.position || item.title,
    company: item.company,
    location: item.location || (item.remote ? 'Remote' : 'Unknown'),
    remote: Boolean(item.remote || (item.tags || []).includes('remote')),
    type: item.job_type || item.type || 'Unknown',
    salaryMin: null,
    salaryMax: null,
    currency: 'USD',
    source: 'remoteok',
    url: item.url || item.apply_url || `https://remoteok.com/remote-jobs/${item.id}`,
    postedAt: item.date || item.created_at || null,
    description: item.description || '',
    tags: Array.isArray(item.tags) ? item.tags : []
  });
}

function filterByQuery(jobs, query) {
  if (!query) return jobs;
  const q = query.toLowerCase();
  return jobs.filter(j => (
    (j.title || '').toLowerCase().includes(q) ||
    (j.company || '').toLowerCase().includes(q) ||
    (j.tags || []).some(t => (t || '').toLowerCase().includes(q))
  ));
}

