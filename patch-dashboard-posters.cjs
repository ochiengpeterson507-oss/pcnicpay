const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!code.includes("async function fetchPosters()")) {
    const fetchPostersCode = `
  async function fetchPosters() {
    try {
      const res = await fetch('/api/posters');
      if (res.ok) {
        const data = await res.json();
        setPosters(data.filter((p: any) => p.isActive) || []);
      }
    } catch (err) {
      console.error('Failed to fetch posters', err);
    }
  }
`;
    code = code.replace(
      "async function fetchStats() {",
      fetchPostersCode + "\n  async function fetchStats() {"
    );
    fs.writeFileSync('src/pages/Dashboard.tsx', code);
}
