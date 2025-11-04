function SourceToggle({ sources, onChange }) {
  // sources is an object like { muse: true, remoteok: true }
  const entries = Object.entries(sources || {});
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {entries.map(([key, val]) => (
        <label key={key} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={!!val}
            onChange={(e) => onChange?.({ ...sources, [key]: e.target.checked })}
          />
          <span style={{ textTransform: 'capitalize' }}>{key}</span>
        </label>
      ))}
    </div>
  );
}

export default SourceToggle;

