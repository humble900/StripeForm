import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SRC_DIRS = ['app', 'components', 'hooks', 'lib'];

// Recursively get all files
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

// Get all files to search against
let allSourceFiles: string[] = [];
for (const dir of SRC_DIRS) {
    const fullDirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullDirPath)) {
        allSourceFiles = getAllFiles(fullDirPath, allSourceFiles);
    }
}

// Read contents of all files
const fileContents = new Map<string, string>();
for (const file of allSourceFiles) {
    fileContents.set(file, fs.readFileSync(file, 'utf-8'));
}

// Targets to check if they are orphaned
const targetDirs = ['components', 'hooks'];
let targetFiles: string[] = [];
for (const dir of targetDirs) {
    const fullDirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullDirPath)) {
        targetFiles = getAllFiles(fullDirPath, targetFiles);
    }
}

console.log(`Scanning ${targetFiles.length} target files against ${allSourceFiles.length} total source files...`);

const orphaned: string[] = [];

for (const targetFile of targetFiles) {
    // e.g. "ui/button.tsx"
    const relativePath = path.relative(ROOT_DIR, targetFile).replace(/\\/g, '/');
    // Just get the filename without extension, e.g. "button" or "Button"
    const parsed = path.parse(targetFile);
    const baseName = parsed.name; // e.g. "button", "useAuth", "FormBuilder"

    // Skip index files
    if (baseName === 'index') continue;

    let isImported = false;

    for (const [sourceFilePath, content] of fileContents.entries()) {
        // Skip checking a file against itself
        if (sourceFilePath === targetFile) continue;

        // Check if the source file imports the baseName
        // Naive check: Does the word baseName appear in the file?
        // It's a heuristic.
        const regex = new RegExp(`\\b${baseName}\\b`, 'i');
        if (regex.test(content)) {
            isImported = true;
            break;
        }
    }

    if (!isImported) {
        orphaned.push(relativePath);
    }
}

console.log('\n--- POTENTIALLY ORPHANED FILES ---');
for (const file of orphaned) {
    console.log(file);
}

// Let's also list the hooks to look for duplicates visually
console.log('\n--- HOOKS DIRECTORY ---');
const hooksDir = path.join(ROOT_DIR, 'hooks');
if (fs.existsSync(hooksDir)) {
    const hookFiles = getAllFiles(hooksDir);
    hookFiles.forEach(hf => console.log(path.basename(hf)));
}
