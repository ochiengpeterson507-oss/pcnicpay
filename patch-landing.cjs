const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

if (!code.includes("posters")) {
  code = code.replace(
    "export default function Landing() {",
    "export default function Landing() {\n  const [posters, setPosters] = React.useState<any[]>([]);\n  React.useEffect(() => {\n    fetch('/api/posters').then(res => res.json()).then(data => {\n      if (Array.isArray(data)) setPosters(data.filter((p: any) => p.isActive));\n    }).catch(() => {});\n  }, []);"
  );

  const posterUI = `
        {posters.length > 0 && (
          <div className="mt-16 w-full max-w-5xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Latest Updates</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posters.map(poster => (
                <div key={poster.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-left hover:border-slate-700 transition-colors">
                  {poster.imageUrl && (
                    <div className="h-48 w-full overflow-hidden">
                      <img src={poster.imageUrl} alt={poster.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <h4 className="text-xl font-bold text-white tracking-tight">{poster.title}</h4>
                    {poster.description && (
                      <p className="mt-2 text-slate-400 text-sm">{poster.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
  `;

  code = code.replace(
    '{/* Hero Section */}',
    posterUI + '\n      {/* Hero Section */}'
  );
  
  fs.writeFileSync('src/pages/Landing.tsx', code);
}
