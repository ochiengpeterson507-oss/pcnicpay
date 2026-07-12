const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const galleryUI = `
        {/* Gallery Section */}
        <div className="col-span-1 md:col-span-12 mt-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Recent Photos</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Group Gallery</p>
            </div>
            {user?.role === 'ADMIN' && (
              <Link to="/admin/gallery" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                Manage Gallery &rarr;
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryItems.length === 0 ? (
              <div className="col-span-full py-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 font-medium">No photos have been uploaded yet.</p>
              </div>
            ) : (
              galleryItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm group">
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
`;

code = code.replace(
  /<\/main>/,
  galleryUI + '\n      </main>'
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
