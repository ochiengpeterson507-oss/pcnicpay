const fs = require('fs');
let code = fs.readFileSync('src/components/AuthProvider.tsx', 'utf8');

code = code.replace(
`          const userData = await res.json();
          setUser(userData);`,
`          const text = await res.text();
          try {
            const userData = JSON.parse(text);
            setUser(userData);
          } catch (e) {
            console.error('Invalid JSON in AuthProvider:', text.substring(0, 50));
            setToken(null);
            localStorage.removeItem('token');
          }`
);

fs.writeFileSync('src/components/AuthProvider.tsx', code);
