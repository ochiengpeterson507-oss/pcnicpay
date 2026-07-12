const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("import multer from 'multer';")) {
  code = code.replace("import express from 'express';", "import express from 'express';\nimport multer from 'multer';");
}

if (!code.includes("const upload = multer({ storage: multer.memoryStorage() });")) {
  code = code.replace("const apiRouter = express.Router();", "const apiRouter = express.Router();\nconst upload = multer({ storage: multer.memoryStorage() });");
}

const uploadEndpoint = `
  apiRouter.post('/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileExt = req.file.originalname.split('.').pop();
      const fileName = \`\${Date.now()}-\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
      const filePath = \`\${req.user.id}/\${fileName}\`;

      const { error: uploadError } = await getSupabase().storage
        .from('gallery')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = getSupabase().storage
        .from('gallery')
        .getPublicUrl(filePath);

      res.json({ url: publicUrlData.publicUrl });
    } catch (err: any) {
      console.error('Upload Error:', err);
      res.status(500).json({ error: err.message });
    }
  });
`;

if (!code.includes("apiRouter.post('/upload'")) {
  code = code.replace("app.use('/api', apiRouter);", uploadEndpoint + "\n  app.use('/api', apiRouter);");
}

fs.writeFileSync('server.ts', code);
