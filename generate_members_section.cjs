const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const membersSection = `
                {/* Top Members */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Top Contributors</h3>
                    <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 transition-colors">
                      <Users className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'Sarah M.', amount: 45000, percentage: 15, online: true },
                      { name: 'John D.', amount: 30000, percentage: 10, online: false },
                      { name: 'Alex K.', amount: 25000, percentage: 8, online: true },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600">
                              {m.name.charAt(0)}
                            </div>
                            <span className={\`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white \${m.online ? 'bg-emerald-500' : 'bg-slate-300'}\`}></span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                              {i === 0 && <span className="bg-amber-100 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded-full">TOP</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">{m.percentage}% of goal</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-slate-700">KES {m.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
`;

code = code.replace(
  "                {/* Announcements */}",
  membersSection + "\n                {/* Announcements */}"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
