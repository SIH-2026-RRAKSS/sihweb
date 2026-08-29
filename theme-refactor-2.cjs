const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = [
    { regex: /border-cyber-800/g, replacement: 'border-slate-200' },
    { regex: /border-slate-700/g, replacement: 'border-slate-200' },
    { regex: /border-slate-800/g, replacement: 'border-slate-200' },
    { regex: /border-zinc-700/g, replacement: 'border-slate-200' },
    { regex: /border-zinc-800/g, replacement: 'border-slate-200' },
    { regex: /bg-slate-800\/50/g, replacement: 'bg-slate-50' },
    { regex: /bg-slate-800/g, replacement: 'bg-slate-50' },
    { regex: /bg-black\/80/g, replacement: 'bg-white/90' },
    { regex: /bg-black/g, replacement: 'bg-white' },
    { regex: /bg-slate-900/g, replacement: 'bg-slate-50' },
    { regex: /bg-zinc-900/g, replacement: 'bg-slate-50' },
    { regex: /bg-gray-900/g, replacement: 'bg-slate-50' },
    { regex: /bg-zinc-800/g, replacement: 'bg-slate-100' },
    
    // Sometimes text was left as text-slate-700 on dark backgrounds, but now that bg is white, it's fine.
    // If it was text-slate-700 on bg-slate-800, maybe it should be text-slate-600.
];

walkDir('src/components', (filePath) => {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        replacements.forEach(r => {
            newContent = newContent.replace(r.regex, r.replacement);
        });
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log('Updated:', filePath);
        }
    }
});
