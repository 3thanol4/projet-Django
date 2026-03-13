const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk(appDir);

const renames = [];

files.forEach(file => {
    const dir = path.dirname(file);
    const ext = path.extname(file);
    const base = path.basename(file, ext);

    if (file.includes('app.routes.ts') || file.includes('app.config.ts')) return;

    let newBase = base;

    if (base.endsWith('.spec')) {
        const actualBase = base.replace('.spec', '');
        if (fs.existsSync(path.join(dir, actualBase + '.html')) || actualBase === 'app') {
            newBase = actualBase + '.component.spec';
        } else if (actualBase.endsWith('-guard')) {
            newBase = actualBase.replace('-guard', '.guard.spec');
        } else if (actualBase.endsWith('-interceptor')) {
            newBase = actualBase.replace('-interceptor', '.interceptor.spec');
        } else if (actualBase.endsWith('-module')) {
            newBase = actualBase.replace('-module', '.module.spec');
        } else {
            newBase = actualBase + '.service.spec';
        }
    } else if (ext === '.ts') {
        if (fs.existsSync(path.join(dir, base + '.html')) || base === 'app') {
            newBase = base + '.component';
        } else if (base.endsWith('-module')) {
            newBase = base.replace('-module', '.module');
        } else if (base.endsWith('-guard')) {
            newBase = base.replace('-guard', '.guard');
        } else if (base.endsWith('-interceptor')) {
            newBase = base.replace('-interceptor', '.interceptor');
        } else {
            newBase = base + '.service';
        }
    } else if (ext === '.html' || ext === '.css') {
        if (fs.existsSync(path.join(dir, base + '.ts'))) {
            newBase = base + '.component';
        }
    }

    if (newBase !== base) {
        renames.push({ oldFile: file, newFile: path.join(dir, newBase + ext), base, newBase });
    }
});

renames.forEach(r => {
    fs.renameSync(r.oldFile, r.newFile);
});

const newFiles = walk(appDir);
newFiles.forEach(file => {
    if (file.endsWith('.ts')) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        const tempMatch = content.match(/templateUrl:\s*'(\.\/[^']+)\.html'/);
        if (tempMatch) {
            content = content.replace(/templateUrl:\s*'(\.\/[^']+)\.html'/, `templateUrl: '$1.component.html'`);
            modified = true;
        }

        const styleMatch = content.match(/styleUrl:\s*'(\.\/[^']+)\.css'/);
        if (styleMatch) {
            content = content.replace(/styleUrl:\s*'(\.\/[^']+)\.css'/, `styleUrl: '$1.component.css'`);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
        }
    }
});

const mainTs = path.join(__dirname, 'src', 'main.ts');
if (fs.existsSync(mainTs)) {
    let content = fs.readFileSync(mainTs, 'utf8');
    content = content.replace(/import\s+{\s*App\s*}\s+from\s+'\.\/app\/app'/, `import { App } from './app/app.component'`);
    fs.writeFileSync(mainTs, content, 'utf8');
}
