const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createZip() {
  const zip = new JSZip();

  function addFolderToZip(folderPath, zipFolder) {
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'public') continue;
      const fullPath = path.join(folderPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const childZip = zipFolder.folder(item);
        addFolderToZip(fullPath, childZip);
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(item, content);
      }
    }
  }

  addFolderToZip(__dirname, zip);

  if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(__dirname, 'public', 'foreverus-project.zip'), zipBuffer);
  console.log('Successfully created public/foreverus-project.zip (size:', zipBuffer.length, 'bytes)');
}

createZip().catch(console.error);
