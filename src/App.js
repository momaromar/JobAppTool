import './App.css';
import { useEffect, useMemo, useState } from 'react';
import JobList from './components/JobList';
import SearchBar from './components/SearchBar';
import SourceToggle from './components/SourceToggle';
import { loadJobsFromLocalStorage, loadSeedJobs, saveJobsToLocalStorage } from './services/storage';
import { mergeJobs } from './services/aggregate';
import { fetchMuseJobs } from './services/providers/muse';
import { fetchRemoteOkJobs } from './services/providers/remoteok';
import { fetchRemotiveJobs } from './services/providers/remotive';
import { fetchArbeitnowJobs } from './services/providers/arbeitnow';

function App() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sources, setSources] = useState({ muse: true, remoteok: true, remotive: true, arbeitnow: true });
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Initial load: localStorage -> seed json -> empty
  useEffect(() => {
    const boot = async () => {
      const persisted = loadJobsFromLocalStorage();
      if (Array.isArray(persisted) && persisted.length) {
        setJobs(persisted);
        return;
      }
      const seed = await loadSeedJobs('/data/jobs.example.json');
      setJobs(seed);
      saveJobsToLocalStorage(seed);
    };
    boot();
  }, []);

  // Derived filtered set
  const visibleJobs = useMemo(() => {
    let list = jobs;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((j) =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.company || '').toLowerCase().includes(q) ||
        (j.tags || []).some((t) => (t || '').toLowerCase().includes(q))
      );
    }
    if (remoteOnly) list = list.filter((j) => !!j.remote);
    return list;
  }, [jobs, query, remoteOnly]);

  async function handleRefresh() {
    setLoading(true);
    setError('');
    try {
      const tasks = [];
      if (sources.muse) tasks.push(fetchMuseJobs(query));
      if (sources.remoteok) tasks.push(fetchRemoteOkJobs(query));
      if (sources.remotive) tasks.push(fetchRemotiveJobs(query));
      if (sources.arbeitnow) tasks.push(fetchArbeitnowJobs(query));
      const results = await Promise.all(tasks);
      const incoming = results.flat();
      const merged = mergeJobs(jobs, incoming);
      setJobs(merged);
      saveJobsToLocalStorage(merged);
    } catch (e) {
      setError('Unable to fetch from selected sources (possibly CORS in browser).');
    } finally {
      setLoading(false);
    }
  }

  // Import/Export removed by request.

  return (
    <div className="App" style={{ maxWidth: 920, margin: '0 auto', padding: 16 }}>
      <h1 style={{ marginBottom: 4 }}>Job App Tool</h1>
      <p style={{ marginTop: 0, color: '#6b7280' }}>Search, aggregate, and manage job postings.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <SearchBar initialQuery={query} onSearch={setQuery} />
        <button onClick={() => setRemoteOnly((v) => !v)} style={btn(!remoteOnly)}>
          {remoteOnly ? 'Remote: ON' : 'Remote: OFF'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <SourceToggle sources={sources} onChange={setSources} />
        <button onClick={handleRefresh} disabled={loading} style={primary}>
          {loading ? 'Fetching…' : 'Fetch from Sources'}
        </button>
        {/* Import/Export controls removed by request */}
      </div>

      {error ? <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div> : null}
      <JobList jobs={visibleJobs} />
    </div>
  );
}

const primary = { padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' };
const secondary = { padding: '8px 12px', borderRadius: 6, border: '1px solid #6b7280', background: '#fff', color: '#374151' };
const btn = (on) => ({ padding: '8px 12px', borderRadius: 6, border: '1px solid ' + (on ? '#10b981' : '#9ca3af'), background: on ? '#10b981' : '#fff', color: on ? '#fff' : '#374151' });

export default App;
