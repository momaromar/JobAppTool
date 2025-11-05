// Arbeitnow Job Board provider (no key). May paginate via `page` query.

import { normalizeJob } from '../aggregate';

export async function fetchArbeitnowJobs(query = '') {
  // Basic fetch of first page; apply client-side query filter
  const endpoint = 'https://www.arbeitnow.com/api/job-board-api';
  try {
    const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Arbeitnow fetch failed');
    const data = await res.json();
    const jobs = Array.isArray(data?.data) ? data.data.map(mapArbeitnowJob).filter(Boolean) : [];
    return filterByQuery(jobs, query);
  } catch (e) {
    return [];
  }
}

function mapArbeitnowJob(item) {
  if (!item || !item.slug) return null;
  const types = Array.isArray(item.job_types) ? item.job_types : [];
  return normalizeJob({
    id: `arbeitnow:${item.slug}`,
    title: item.title,
    company: item.company_name,
    location: item.location || 'Unknown',
    remote: Boolean(item.remote),
    type: types[0] || 'Unknown',
    salaryMin: null,
    salaryMax: null,
    currency: null,
    source: 'arbeitnow',
    url: item.url,
    postedAt: item.created_at || null,
    description: item.description || '',
    tags: Array.isArray(item.tags) ? item.tags : []
  });
}

function filterByQuery(jobs, query) {
  if (!query) return jobs;
  const q = query.toLowerCase();
  return jobs.filter((j) => (
    (j.title || '').toLowerCase().includes(q) ||
    (j.company || '').toLowerCase().includes(q) ||
    (j.tags || []).some((t) => (t || '').toLowerCase().includes(q))
  ));
}

