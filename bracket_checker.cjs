const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');

let balance = 0;
for(let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // naive check
  for (let j = 0; j < line.length; j++) {
     if (line[j] === '{') balance++;
     if (line[j] === '}') balance--;
  }
  if (balance < 0) {
      console.log('Balance dropped below 0 at line', i+1);
  }
}
console.log('Final balance:', balance);
