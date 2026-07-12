const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');

let tryLine = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('try {')) tryLine.push(i + 1);
    if (lines[i].includes('catch')) tryLine.pop();
}
console.log('Unclosed tries at lines:', tryLine);
