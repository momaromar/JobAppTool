function JobCard({ job }) {
  return (
    <div className="job-card" style={styles.card}>
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>{job.title}</h3>
        <span style={styles.badge}>{job.source}</span>
      </div>
      <div style={styles.sub}>
        <strong>{job.company}</strong>
        <span> • </span>
        <span>{job.location}</span>
        {job.remote ? <span> • Remote</span> : null}
        {job.type ? <span> • {job.type}</span> : null}
      </div>
      {job.tags?.length ? (
        <div style={styles.tags}>
          {job.tags.slice(0, 6).map((t) => (
            <span key={t} style={styles.tag}>{t}</span>
          ))}
        </div>
      ) : null}
      <div style={styles.footer}>
        <a href={job.url} target="_blank" rel="noreferrer">View</a>
        {job.postedAt ? <span style={{ color: '#666' }}>Posted: {new Date(job.postedAt).toLocaleDateString()}</span> : null}
      </div>
    </div>
  );
}

const styles = {
  card: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sub: { color: '#374151', marginTop: 4 },
  tags: { marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' },
  tag: { background: '#f3f4f6', borderRadius: 12, padding: '2px 8px', fontSize: 12 },
  badge: { fontSize: 12, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 6, padding: '2px 6px', color: '#4f46e5' },
  footer: { marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
};

export default JobCard;

