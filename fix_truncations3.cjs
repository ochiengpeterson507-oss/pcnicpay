const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const patches = [
  {
    search: "      if (error) throw error;\n   \n     \n  apiRouter.post('/expenses',",
    replace: "      if (error) throw error;\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.post('/expenses',"
  }
];

// Let's print out the exact string between "if (error) throw error;" and "apiRouter.post('/expenses',"
const match1 = code.match(/if \(error\) throw error;[\s\S]*?apiRouter\.post\('\/expenses',/);
console.log('Match 1:', JSON.stringify(match1?.[0]));

const match2 = code.match(/emitEvent\('new-expense', data\);[\s\S]*?apiRouter\.get\('\/expenses',/);
console.log('Match 2:', JSON.stringify(match2?.[0]));

const match3 = code.match(/if \(error\) throw error;[\s\S]*?apiRouter\.put\('\/notifications\/:id\/read',/);
console.log('Match 3:', JSON.stringify(match3?.[0]));

const match4 = code.match(/if \(error\) throw error;[\s\S]*?\/\/ Admin CRUD for Posters/);
console.log('Match 4:', JSON.stringify(match4?.[0]));

const match5 = code.match(/if \(error\) throw error;[\s\S]*?apiRouter\.delete\('\/expenses\/:id',/);
console.log('Match 5:', JSON.stringify(match5?.[0]));

if(match1) code = code.replace(match1[0], `if (error) throw error;\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.post('/expenses',`);
if(match2) code = code.replace(match2[0], `emitEvent('new-expense', data);\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.get('/expenses',`);
if(match3) code = code.replace(match3[0], `if (error) throw error;\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.put('/notifications/:id/read',`);
// Match 4 is the one in put /notifications/:id/read leading to // Admin CRUD for Posters
// BUT wait, let's look at what match 4 actually captures: it might capture too much.
// We should make it lazy but it's already lazy.
if(match4) {
    const linesCount = match4[0].split('\\n').length;
    if(linesCount < 15) {
        code = code.replace(match4[0], `if (error) throw error;\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  // Admin CRUD for Posters`);
    }
}
if(match5) {
    const linesCount = match5[0].split('\\n').length;
    if(linesCount < 15) {
        code = code.replace(match5[0], `if (error) throw error;\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.delete('/expenses/:id',`);
    }
}

fs.writeFileSync('server.ts', code);
