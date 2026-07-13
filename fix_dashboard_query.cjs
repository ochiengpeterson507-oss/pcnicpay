const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!code.includes("useQuery")) {
  code = code.replace(
    "import React, { useEffect, useState, useMemo } from 'react';",
    "import React, { useEffect, useState, useMemo } from 'react';\nimport { useQuery, useQueryClient } from '@tanstack/react-query';"
  );

  code = code.replace(
    "  const [stats, setStats] = useState({ members: 0, collected: 0, expenses: 0, balance: 0 });\n  const [payments, setPayments] = useState<any[]>([]);\n  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);",
    `  const queryClient = useQueryClient();
  const { data: stats = { members: 0, collected: 0, expenses: 0, balance: 0 } } = useQuery({ queryKey: ['stats'], queryFn: async () => { const res = await fetch('/api/stats'); return res.json(); }});
  const { data: payments = [] } = useQuery({ queryKey: ['payments'], queryFn: async () => { const res = await fetch('/api/payments'); return res.json(); }});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);`
  );
  
  code = code.replace(
    "fetchStats();\n          fetchPayments();",
    "queryClient.invalidateQueries({ queryKey: ['stats'] });\n          queryClient.invalidateQueries({ queryKey: ['payments'] });"
  );
  
  code = code.replace(
    "fetchStats();",
    "queryClient.invalidateQueries({ queryKey: ['stats'] });"
  );

  // remove fetchStats and fetchPayments declarations
  code = code.replace(/  async function fetchStats\(\) \{[\s\S]*?  \};\n/g, '');
  code = code.replace(/  async function fetchPayments\(\) \{[\s\S]*?  \};\n/g, '');
  
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
}
