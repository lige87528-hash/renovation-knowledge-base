/**
 * 相关文章数据 — 构建阶段预计算，解决 SSR 时 site.pages 为空的问题
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = path.join(__dirname, '..')

function walkDir(dir) {
  let results = []
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      results = results.concat(walkDir(filePath))
    } else if (file.endsWith('.md')) {
      results.push(filePath)
    }
  }
  return results
}

function parseFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return {}
  const fmText = fmMatch[1]
  const fm = {}
  const lines = fmText.split('\n')
  let currentKey = null
  let currentLines = []
  for (const line of lines) {
    const kvMatch = line.match(/^(\w[\w_]*):\s*(.*)/)
    if (kvMatch) {
      if (currentKey && currentLines.length > 0) {
        finalizeFmValue(fm, currentKey, currentLines.join('\n').trim())
      }
      currentKey = kvMatch[1]
      currentLines = [kvMatch[2]]
    } else if (currentKey && (line.startsWith('  ') || line.startsWith('- '))) {
      currentLines.push(line)
    } else if (currentKey) {
      finalizeFmValue(fm, currentKey, currentLines.join('\n').trim())
      currentKey = null
      currentLines = []
    }
  }
  if (currentKey) finalizeFmValue(fm, currentKey, currentLines.join('\n').trim())
  return fm
}

function finalizeFmValue(fm, key, val) {
  if (val.startsWith('[') && val.endsWith(']')) {
    try { fm[key] = JSON.parse(val) } catch { fm[key] = val }
  } else {
    fm[key] = val
  }
}

// Build page index
const mdFiles = walkDir(docsDir)
const pageIndex = []

for (const file of mdFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const fm = parseFrontmatter(content)
  const relPath = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.md$/, '')
  if (relPath.startsWith('tags/') || relPath === 'index') continue
  const titleMatch = content.match(/^#\s+(.+)$/m)
  // Derive category from directory path, not frontmatter (many pages have category: docs incorrectly)
  const dirParts = relPath.split('/')
  const actualCategory = dirParts.length > 1 ? dirParts[0] : ''
  pageIndex.push({
    relativePath: relPath + '.md',
    title: titleMatch ? titleMatch[1] : '未命名',
    frontmatter: {
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      category: actualCategory,
    },
  })
}

// Pre-compute related articles for each page
const relatedMap = {}

for (const page of pageIndex) {
  const currentPath = page.relativePath
  const currentTags = page.frontmatter.tags || []
  const currentCategory = page.frontmatter.category || ''

  const scored = pageIndex
    .filter(p => p.relativePath !== currentPath)
    .map(p => {
      const pTags = p.frontmatter.tags || []
      const pCat = p.frontmatter.category || ''
      let score = 0
      if (currentTags.length > 0) {
        score = currentTags.filter(t => pTags.includes(t)).length
      } else {
        score = pCat === currentCategory ? 1 : 0
      }
      if (pCat === currentCategory) score += 0.5
      return { page: p, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => ({
      title: x.page.title,
      link: '/' + x.page.relativePath.replace(/\.md$/, '').replace(/\/index$/, '') + '/',
      category: x.page.frontmatter.category || '',
    }))

  relatedMap[currentPath] = scored
}

export { relatedMap, pageIndex }
