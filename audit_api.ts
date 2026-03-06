import fs from 'fs'
import path from 'path'

function getFiles(dir: string, ext: string = '', fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList
    const files = fs.readdirSync(dir)
    for (const file of files) {
        const stat = fs.statSync(path.join(dir, file))
        if (stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next')) {
                getFiles(path.join(dir, file), ext, fileList)
            }
        } else {
            if (file.endsWith(ext) || ext === '') {
                fileList.push(path.join(dir, file))
            }
        }
    }
    return fileList
}

const apiDir = path.join(process.cwd(), 'app', 'api')
const apiFiles = getFiles(apiDir, 'route.ts')
const definedEndpoints = new Set<string>()

for (const file of apiFiles) {
    let endpoint = file.replace(apiDir, '/api').replace(/\\/g, '/').replace('/route.ts', '')
    endpoint = endpoint.replace(/\[.*?\]/g, '*')
    definedEndpoints.add(endpoint)
}
console.log(`Found ${definedEndpoints.size} defined API endpoints.`)

const srcDirs = ['app', 'components', 'hooks', 'lib']
let srcFiles: string[] = []
for (const dir of srcDirs) {
    if (fs.existsSync(path.join(process.cwd(), dir))) {
        srcFiles = srcFiles.concat(getFiles(path.join(process.cwd(), dir), '.ts'))
        srcFiles = srcFiles.concat(getFiles(path.join(process.cwd(), dir), '.tsx'))
    }
}

const fetchRegex = /(?:fetch\(\s*|apiCall\(\s*)['"`](\/api\/[^'"`\?]+)/g
const usedEndpoints = new Set<string>()

for (const filePath of srcFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    let match
    while ((match = fetchRegex.exec(content)) !== null) {
        let url = match[1]
        url = url.replace(/\/[a-zA-Z0-9_.-]+(?=\/|$)/g, (segment) => {
            if (segment.match(/\/[0-9a-fA-F-]+/)) return '/*'
            if (segment.length > 20) return '/*'
            return segment
        })
        usedEndpoints.add(url)
    }
}
console.log(`Found ${usedEndpoints.size} consumed API endpoints.`)

console.log('\n--- POTENTIAL ORPHANED API ENDPOINTS ---')
for (const endpoint of definedEndpoints) {
    let found = false
    for (const used of usedEndpoints) {
        if (used.startsWith(endpoint.replace('/*', '')) || endpoint.startsWith(used.replace('/*', ''))) {
            found = true
            break
        }
    }
    if (!found) {
        console.log(endpoint)
    }
}

console.log('\n--- POTENTIAL 404 ENDPOINTS ---')
for (const used of usedEndpoints) {
    let found = false
    for (const endpoint of definedEndpoints) {
        if (used.startsWith(endpoint.replace('/*', '')) || endpoint.startsWith(used.replace('/*', ''))) {
            found = true
            break
        }
    }
    if (!found) {
        console.log(used)
    }
}
