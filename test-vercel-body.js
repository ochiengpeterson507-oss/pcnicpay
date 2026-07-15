const express = require('express');

const app = express();
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.post('/test', (req, res) => {
  res.json({ body: req.body });
});

const req = new (require('http').IncomingMessage)();
req.method = 'POST';
req.url = '/test';
req.headers = { 'content-type': 'application/json' };
req.body = { amount: 100 }; // Mock Vercel parsing

const res = new (require('http').ServerResponse)(req);
res.end = (chunk) => console.log('Response:', chunk.toString());

app(req, res);
