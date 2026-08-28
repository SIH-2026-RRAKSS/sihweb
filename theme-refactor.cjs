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
    // Fonts
    { regex: /font-mono/g, replacement: 'font-sans' },
    
    // Backgrounds
    { regex: /bg-\[#0C0E12\]/g, replacement: 'bg-white' },
    { regex: /bg-\[#060709\]/g, replacement: 'bg-slate-50' },
    { regex: /bg-\[#12151B\]/g, replacement: 'bg-white' },
    { regex: /bg-\[#1A1E26\]/g, replacement: 'bg-slate-100' },
    { regex: /bg-tactical-surface/g, replacement: 'bg-white' },
    { regex: /bg-tactical-void/g, replacement: 'bg-[#F8FAFC]' },
    { regex: /bg-cyber-950(\/[0-9]+)?/g, replacement: 'bg-white' },
    { regex: /bg-cyber-900(\/[0-9]+)?/g, replacement: 'bg-white' },
    { regex: /bg-cyber-850(\/[0-9]+)?/g, replacement: 'bg-slate-50' },
    { regex: /bg-cyber-800(\/[0-9]+)?/g, replacement: 'bg-slate-50' },
    { regex: /bg-cyber-700(\/[0-9]+)?/g, replacement: 'bg-slate-100' },
    { regex: /bg-white\/5/g, replacement: 'bg-slate-100' },
    { regex: /bg-white\/10/g, replacement: 'bg-slate-100' },
    
    // Text colors
    { regex: /text-white/g, replacement: 'text-slate-900' },
    { regex: /text-slate-100/g, replacement: 'text-slate-900' },
    { regex: /text-slate-200/g, replacement: 'text-slate-800' },
    { regex: /text-slate-300/g, replacement: 'text-slate-700' },
    { regex: /text-slate-400/g, replacement: 'text-slate-500' },
    { regex: /text-zinc-200/g, replacement: 'text-slate-800' },
    { regex: /text-zinc-300/g, replacement: 'text-slate-700' },
    { regex: /text-zinc-400/g, replacement: 'text-slate-500' },
    { regex: /text-zinc-500/g, replacement: 'text-slate-500' },
    
    // Borders
    { regex: /border-white\/10/g, replacement: 'border-slate-200' },
    { regex: /border-white\/20/g, replacement: 'border-slate-200' },
    { regex: /border-white\/5/g, replacement: 'border-slate-100' },
    { regex: /border-tactical-border/g, replacement: 'border-slate-200' },
    { regex: /border-cyber-700(\/[0-9]+)?/g, replacement: 'border-slate-200' },
    { regex: /border-cyber-600(\/[0-9]+)?/g, replacement: 'border-slate-200' },
    
    // Hovers
    { regex: /hover:bg-white\/10/g, replacement: 'hover:bg-slate-200' },
    { regex: /hover:bg-cyber-700/g, replacement: 'hover:bg-slate-100' },
    
    // Shadows
    { regex: /shadow-industrial-sm/g, replacement: 'shadow-sm' },
    { regex: /shadow-industrial-md/g, replacement: 'shadow-md' },
    
    // Specific elements like cyber-card from index.css
    { regex: /cyber-card/g, replacement: 'bg-white border border-slate-200 rounded-2xl shadow-sm' }
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
