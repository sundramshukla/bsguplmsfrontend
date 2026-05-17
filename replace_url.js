const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('http://187.127.169.75')) {
        let originalContent = content;
        
        // Determine relative path to config.js
        const relativePathToSrc = path.relative(path.dirname(filePath), srcDir);
        let configPath = relativePathToSrc ? `${relativePathToSrc}/config` : './config';
        configPath = configPath.replace(/\\/g, '/'); // Windows support
        if (!configPath.startsWith('.')) {
            configPath = './' + configPath;
        }

        // Replace 'http://187.127.169.75' with '${BASE_URL}'
        // Single quote urls: 'http://187.127.169.75/...' -> `${BASE_URL}/...`
        content = content.replace(/'http:\/\/187\.127\.169\.75(.*?)'/g, '`${BASE_URL}$1`');
        // Double quote urls (if any): "http://187.127.169.75/..." -> `${BASE_URL}/...`
        content = content.replace(/"http:\/\/187\.127\.169\.75(.*?)"/g, '`${BASE_URL}$1`');
        // Template literal urls: `http://187.127.169.75/...` -> `${BASE_URL}/...`
        content = content.replace(/http:\/\/187\.127\.169\.75/g, '${BASE_URL}');
        
        // Add import statement if not already there
        if (!content.includes('BASE_URL')) return; // Just in case
        if (!content.includes('import { BASE_URL }')) {
            // Find last import
            const lines = content.split('\n');
            let lastImportIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('import ')) {
                    lastImportIndex = i;
                }
            }
            const importStatement = `import { BASE_URL } from '${configPath}';`;
            if (lastImportIndex !== -1) {
                lines.splice(lastImportIndex + 1, 0, importStatement);
            } else {
                lines.unshift(importStatement);
            }
            content = lines.join('\n');
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

walkDir(srcDir);
