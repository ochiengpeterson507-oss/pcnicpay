const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add posters state
code = code.replace(
  "const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);",
  "const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);\n  const [posters, setPosters] = useState<any[]>([]);"
);

// Fetch posters in useEffect
code = code.replace(
  "    fetchStats();\n    fetchPayments();",
  "    fetchStats();\n    fetchPayments();\n    fetchPosters();"
);

// Add fetchPosters function
const fetchPostersFn = `
  const fetchPosters = async () => {
    try {
      const res = await fetch('/api/posters');
      if (res.ok) {
        const data = await res.json();
        setPosters(data.filter((p: any) => p.isActive) || []);
      }
    } catch (err) {
      console.error('Failed to fetch posters', err);
    }
  };
`;

code = code.replace(
  "const fetchStats = async () => {",
  fetchPostersFn + "\n  const fetchStats = async () => {"
);

// Add Poster Banner in the render, right after header
const posterUI = `
      {posters.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posters.map(poster => (
              <div key={poster.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                {poster.imageUrl && (
                  <div className="h-48 w-full overflow-hidden">
                    <img src={poster.imageUrl} alt={poster.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white tracking-tight">{poster.title}</h3>
                  {poster.description && (
                    <p className="mt-2 text-slate-400 text-sm leading-relaxed">{poster.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
`;

code = code.replace(
  '<main className="pb-16">',
  '<main className="pb-16">\n' + posterUI
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
