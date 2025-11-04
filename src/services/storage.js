// Utilities for loading, saving, importing, and exporting job data

const STORAGE_KEY = 'jobapptool.jobs.v1';

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

export function exportJobsToFile(jobs, filename = 'jobs-export.json') {
  const blob = new Blob([JSON.stringify(jobs || [], null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importJobsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        resolve(data);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

