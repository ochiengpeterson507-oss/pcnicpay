const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  "queryClient.invalidateQueries({ queryKey: ['stats'] });\n    fetchPayments();",
  "queryClient.invalidateQueries({ queryKey: ['stats'] });\n    queryClient.invalidateQueries({ queryKey: ['payments'] });"
);

code = code.replace(
  ".on('postgres_changes', { event: '*', schema: 'public', table: 'Expense' }, payload => {\n          fetchStats();",
  ".on('postgres_changes', { event: '*', schema: 'public', table: 'Expense' }, payload => {\n          queryClient.invalidateQueries({ queryKey: ['stats'] });"
);

code = code.replace(
  "onSuccessCallback={() => { fetchStats(); fetchPayments(); }}",
  "onSuccessCallback={() => { queryClient.invalidateQueries({ queryKey: ['stats'] }); queryClient.invalidateQueries({ queryKey: ['payments'] }); }}"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
