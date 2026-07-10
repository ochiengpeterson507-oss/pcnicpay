const express = require('express');
const app = express();
app.use('/api', (req, res) => res.json({ msg: '/api matched', url: req.url }));
app.use('/', (req, res) => res.json({ msg: '/ matched', url: req.url }));
app.listen(3001, () => console.log('started'));
