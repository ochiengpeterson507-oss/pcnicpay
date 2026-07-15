const multer = require('multer');
const upload = multer({ dest: '/tmp/nonexistent-dir/' });
console.log('Multer init successful');
