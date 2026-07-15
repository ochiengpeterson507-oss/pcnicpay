const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Gallery.tsx', 'utf8');

const target = `      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { url } = await uploadRes.json();`;

const replacement = `      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const resData = await uploadRes.json();
      const url = resData.url;`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/Admin/Gallery.tsx', code);
    console.log('Successfully patched src/pages/Admin/Gallery.tsx');
} else {
    console.log('Target not found in src/pages/Admin/Gallery.tsx');
}
