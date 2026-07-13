const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

const ts = require('typescript');
const sourceFile = ts.createSourceFile('server.ts', code, ts.ScriptTarget.Latest, true);

function traverse(node) {
    if (node.kind === ts.SyntaxKind.TryStatement) {
        if (!node.catchClause && !node.finallyBlock) {
             console.log('Unclosed try at line:', sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1);
        }
    }
    ts.forEachChild(node, traverse);
}
traverse(sourceFile);
