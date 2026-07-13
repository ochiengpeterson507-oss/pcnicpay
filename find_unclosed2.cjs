const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

const lines = code.split('\n');
let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('apiRouter.')) {
      stack.push({ line: i+1, type: 'route', text: line.trim() });
  }
  // simplified bracket matching for the root level
}

let blocks = [];
let currentDepth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for(let j=0; j<line.length; j++) {
        if (line[j] === '{') {
            blocks.push({ line: i+1, depth: currentDepth });
            currentDepth++;
        } else if (line[j] === '}') {
            currentDepth--;
            blocks.pop();
        }
    }
}
console.log('Unclosed blocks:');
blocks.forEach(b => {
    console.log(`Line ${b.line}: ${lines[b.line-1]}`);
});

