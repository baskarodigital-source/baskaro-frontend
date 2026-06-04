import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src')

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(jsx|js|tsx|ts)$/.test(e.name)) out.push(p)
  }
  return out
}

function relImport(file) {
  const rel = path.relative(path.dirname(file), path.join(root, 'lib/appDialog.js')).replace(/\\/g, '/')
  return rel.startsWith('.') ? rel : `./${rel}`
}

for (const file of walk(root)) {
  if (file.includes('appDialog.js') || file.includes('DialogContext.jsx')) continue

  let s = fs.readFileSync(file, 'utf8')
  if (!/\b(window\.)?(alert|confirm)\s*\(/.test(s)) continue
  if (s.includes("from '../lib/appDialog.js'") || s.includes('from "../lib/appDialog.js"')) continue

  const imp = relImport(file)
  const importLine = `import { appAlert, appConfirm } from '${imp}'\n`
  const firstImport = s.match(/^import .+$/m)
  if (firstImport) {
    const lineEnd = s.indexOf('\n', s.indexOf(firstImport[0])) + 1
    s = s.slice(0, lineEnd) + importLine + s.slice(lineEnd)
  } else {
    s = importLine + s
  }

  s = s.replace(/window\.alert\s*\(/g, 'appAlert(')
  s = s.replace(/(?<!app)alert\s*\(/g, 'appAlert(')
  s = s.replace(/window\.confirm\s*\(/g, 'await appConfirm(')
  s = s.replace(/(?<!app)confirm\s*\(/g, 'await appConfirm(')
  s = s.replace(/if\s*\(\s*!await appConfirm/g, 'if (!(await appConfirm')
  s = s.replace(/return await appConfirm/g, 'return void await appConfirm')
  s = s.replace(/return void await appConfirm/g, 'return await appConfirm')

  fs.writeFileSync(file, s)
  console.log('updated', path.relative(root, file))
}
