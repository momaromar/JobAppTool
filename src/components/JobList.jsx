import JobCard from './JobCard';

function JobList({ jobs }) {
  if (!jobs || jobs.length === 0) {
    return <div style={{ color: '#6b7280' }}>No jobs to display.</div>;
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </div>
  );
}

export default JobList;

