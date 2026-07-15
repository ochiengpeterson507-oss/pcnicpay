const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  apiRouter.post('/upload', authenticateToken, requireAdmin, (req, res) => {
    upload.single('file')(req, res, async (err) => {`;

const replacement = `  apiRouter.post('/upload', authenticateToken, requireAdmin, (req, res) => {
    try {
      upload.single('file')(req, res, async (err) => {`;

code = code.replace(target, replacement);

const target2 = `        return res.status(500).json({ success: false, error: err?.message || 'Unexpected server error during upload' });
      }
    });
  });`;

const replacement2 = `        return res.status(500).json({ success: false, error: err?.message || 'Unexpected server error during upload' });
      }
    });
    } catch (e: any) {
      console.error('Outer Upload Exception:', e);
      return res.status(500).json({ success: false, error: e?.message || 'Unexpected outer server error during upload' });
    }
  });`;

code = code.replace(target2, replacement2);
fs.writeFileSync('server.ts', code);
