// Utilities for loading, saving, importing, and exporting job data

const STORAGE_KEY = 'jobapptool.jobs.v1';

export function clearJobsStorage() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage access errors
  }
}

export function loadJobsFromLocalStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveJobsToLocalStorage(jobs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs || []));
  } catch {
    // ignore quota or serialization errors
  }
}

export async function loadSeedJobs(path = '/data/jobs.example.json') {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load seed');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
