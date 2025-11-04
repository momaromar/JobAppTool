import { useState } from 'react';

function SearchBar({ initialQuery = '', onSearch }) {
  const [value, setValue] = useState(initialQuery);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch?.(value.trim());
      }}
      style={{ display: 'flex', gap: 8 }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search title, company, tags"
        style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
      />
      <button type="submit" style={styles.button}>Search</button>
    </form>
  );
}

const styles = {
  button: { padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' },
};

export default SearchBar;

