const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `          const { data, error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(filePath, req.file.buffer, {
              contentType: req.file.mimetype,
              upsert: true
            });`;

const replacement = `          const bucketName = 'gallery';
          console.log('[Supabase Storage] Uploading to bucket:', bucketName, 'filePath:', filePath);
          
          // Verify bucket exists
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.find(b => b.name === bucketName);
          console.log('[Supabase Storage] Bucket exists:', !!bucketExists);

          const { data, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, req.file.buffer, {
              contentType: req.file.mimetype,
              upsert: true
            });
          
          console.log('[Supabase Storage] Upload result:', data, 'Error:', uploadError);
`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
