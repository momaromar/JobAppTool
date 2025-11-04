// The Muse provider (no key). Note: CORS may block in browser.

import { normalizeJob } from '../aggregate';

export async function fetchMuseJobs(query = '') {
  // API docs: https://www.themuse.com/developers/api/v2
  // Example endpoint with pagination
  const params = new URLSearchParams({ page: '1', descending: 'true', q: query || '' });
  const endpoint = `https://www.themuse.com/api/public/jobs?${params.toString()}`;
  try {
    const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Muse fetch failed');
    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    return results.map(mapMuseJob).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function mapMuseJob(item) {
  if (!item || !item.id) return null;
  const locations = Array.isArray(item.locations) ? item.locations.map(l => l?.name).filter(Boolean) : [];
  const categories = Array.isArray(item.categories) ? item.categories.map(c => c?.name).filter(Boolean) : [];
  return normalizeJob({
    id: `muse:${item.id}`,
    title: item.name,
    company: item.company?.name || 'Unknown',
    location: locations[0] || 'Unknown',
    remote: (locations.join(' | ').toLowerCase().includes('remote')),
    type: item.type || 'Unknown',
    salaryMin: null,
    salaryMax: null,
    currency: null,
    source: 'muse',
    url: item.refs?.landing_page || '#',
    postedAt: item.publication_date || null,
    description: item.contents || '',
    tags: categories
  });
}

