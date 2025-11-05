// Remotive provider (no key). Generally CORS-friendly.

import { normalizeJob } from '../aggregate';

export async function fetchRemotiveJobs(query = '') {
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  const endpoint = `https://remotive.com/api/remote-jobs?${params.toString()}`;
  try {
    const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Remotive fetch failed');
    const data = await res.json();
    const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
    return jobs.map(mapRemotiveJob).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function mapRemotiveJob(item) {
  if (!item || !item.id) return null;
  const salary = item.salary || '';
  const parsed = parseSalaryRange(salary);
  return normalizeJob({
    id: `remotive:${item.id}`,
    title: item.title,
    company: item.company_name,
    location: item.candidate_required_location || 'Remote',
    remote: true,
    type: item.job_type || 'Unknown',
    salaryMin: parsed.min,
    salaryMax: parsed.max,
    currency: parsed.currency,
    source: 'remotive',
    url: item.url,
    postedAt: item.publication_date,
    description: item.description || '',
    tags: Array.isArray(item.tags) ? item.tags : []
  });
}

function parseSalaryRange(str) {
  // Very loose parsing; strings vary widely
  if (!str) return { min: null, max: null, currency: null };
  const m = str.match(/([$€£])?\s*(\d{2,3}[,\.]?\d{0,3})\s*(?:[-–to]+)\s*(\d{2,3}[,\.]?\d{0,3})/i);
  if (!m) return { min: null, max: null, currency: null };
  const currency = m[1] || null;
  const toNum = (s) => Number(String(s).replace(/[,\.]/g, '')) || null;
  return { min: toNum(m[2]), max: toNum(m[3]), currency };
}

