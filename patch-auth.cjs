const fs = require('fs');
let code = fs.readFileSync('src/components/AuthProvider.tsx', 'utf8');

// Add a fallback timeout to AuthProvider so it doesn't get stuck loading forever
code = code.replace(
  "setIsLoading(false);",
  "setIsLoading(false);\n      }\n      \n      // Safety fallback in case something hangs\n      setTimeout(() => {\n        setIsLoading(false);\n      }, 3000);"
);

// We should be careful where we insert this. A better way:
// Let's just do a regex replace on checkAuth
code = code.replace(
  /checkAuth\(\);/,
  "checkAuth();\n    // Fallback timeout\n    const timer = setTimeout(() => setIsLoading(false), 2000);\n    return () => clearTimeout(timer);"
);

fs.writeFileSync('src/components/AuthProvider.tsx', code);
