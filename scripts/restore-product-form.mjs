import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const target = path.resolve(__dirname, '../src/pages/Admin/products/ProductForm.jsx')
const canonical = path.resolve(__dirname, 'product-form.canonical.jsx')

const force = process.argv.includes('--force')

function isCorrupted(text) {
  return (
    text.includes('clearProductFormErrors(setErrors, fields)') ||
    text.includes('function patchProductForm(setForm') ||
    text.includes('keys.forEach((field) =>')
  )
}

function sanitize(text) {
  if (!isCorrupted(text)) return text

  const helpersImport = `import {
  clearProductFormErrors,
  getBrandSelectPlaceholder,
  getDeviceSelectPlaceholder,
  patchProductForm,
  setProductFormField,
} from '../../../lib/productFormHelpers.js'
`

  let out = text

  if (!out.includes('productFormHelpers.js')) {
    out = out.replace(/(import AttributeMediaUpload[^\n]+\n)/, `$1${helpersImport}\n`)
  }

  out = out.replace(
    /(function refId\(value\)\s*\{[\s\S]*?\}\s*)\n[\s\S]*?(export default function ProductForm)/,
    `$1\n\nexport default function ProductForm`,
  )

  if (!out.startsWith('// @ts-nocheck')) {
    out = `// @ts-nocheck\n${out.replace(/^\/\/ @ts-nocheck[\s\S]*?\n/, '')}`
  }

  return out
}

if (!fs.existsSync(canonical)) {
  console.error('Missing scripts/product-form.canonical.jsx')
  process.exit(1)
}

const before = fs.readFileSync(target, 'utf8')
const clean = fs.readFileSync(canonical, 'utf8')

if (force || isCorrupted(before)) {
  const next = force ? clean : sanitize(before)
  fs.writeFileSync(target, next, 'utf8')
  console.log(
    'Restored ProductForm.jsx (%d lines). Reload the file in your editor (Revert File).',
    next.split(/\r?\n/).length,
  )
  process.exit(0)
}

console.log('ProductForm.jsx OK (%d lines).', before.split(/\r?\n/).length)
