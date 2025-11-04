// Aggregation and normalization utilities

export function normalizeJob(job) {
  // Ensure required fields exist with safe defaults
  return {
    id: job.id ?? `${job.source || 'unknown'}:${job.title || 'untitled'}:${job.url || Math.random()}`,
    title: job.title || 'Untitled',
    company: job.company || 'Unknown',
    location: job.location || 'Unknown',
    remote: Boolean(job.remote),
    type: job.type || 'Unknown',
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    currency: job.currency || null,
    source: job.source || 'unknown',
    url: job.url || '#',
    postedAt: job.postedAt || null,
    description: job.description || '',
    tags: Array.isArray(job.tags) ? job.tags : [],
  };
}

export function mergeJobs(current, incoming) {
  const byKey = new Map();
  const add = (j) => {
    const key = j.id || `${j.source}:${j.url}`;
    if (!byKey.has(key)) byKey.set(key, j);
  };
  (current || []).forEach((j) => add(normalizeJob(j)));
  (incoming || []).forEach((j) => add(normalizeJob(j)));
  return Array.from(byKey.values());
}

