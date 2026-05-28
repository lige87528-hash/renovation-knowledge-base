/**
 * 从所有 .md 文章中提取 tags，生成 tags/index.md 标签云页面
 * 运行: node docs/.vitepress/generate-tags.cjs
 */
const fs = require('fs')
const path = require('path')

const docsDir = path.join(__dirname, '..')
const tagsDir = path.join(docsDir, 'tags')

if (!fs.existsSync(tagsDir)) {
  fs.mkdirSync(tagsDir, { recursive: true })
}

const categoryNames = {
  whitepaper: '装修白皮书',
  standards: '施工规范',
  models: '家装模式',
  crafts: '工种工艺',
  pricing: '报价预算',
  inspection: '验收标准',
  materials: '材料选购',
  pitfalls: '避坑指南',
  market: '市场分析',
  enterprises: '龙头企业',
}

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

// Extract all tags
const mdFiles = walkDir(docsDir)
const tagMap = {}
let totalArticles = 0

for (const file of mdFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const fm = parseFrontmatter(content)
  const relPath = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.md$/, '')
  if (relPath.startsWith('tags/') || relPath === 'index') continue
  const tags = fm.tags || []
  if (!Array.isArray(tags) || tags.length === 0) continue
  const title = (content.match(/^#\s+(.+)$/m) || [])[1] || '未命名'
  const category = fm.category || ''
  const catName = categoryNames[category] || category
  for (const tag of tags) {
    if (!tagMap[tag]) tagMap[tag] = []
    tagMap[tag].push({ title, link: '/' + relPath, category, catName })
  }
  totalArticles++
}

const sortedTags = Object.entries(tagMap).sort((a, b) => b[1].length - a[1].length)

// Build JSON string for the Vue component
const tagJson = sortedTags.map(function(entry) {
  return {
    tag: entry[0],
    count: entry[1].length,
    articles: entry[1].map(function(a) {
      return {
        title: a.title,
        link: a.link.endsWith('/') ? a.link : a.link + '/',
        catName: a.catName
      }
    })
  }
})

// Write tags index page
const tagsIndex = `---
layout: page
title: 标签云
---

<script setup>
import { ref } from 'vue'

const allTags = ` + JSON.stringify(tagJson) + `

const selectedTag = ref('')

function selectTag(tag) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
}
</script>

<div class="tags-page">
  <div class="tags-hero">
    <h1>标签云</h1>
    <p>按标签浏览全站文章，共 {{ allTags.length }} 个标签</p>
  </div>

  <div class="tags-cloud">
    <button
      v-for="item in allTags"
      :key="item.tag"
      class="tag-btn"
      :class="{ active: selectedTag === item.tag }"
      @click="selectTag(item.tag)"
    >
      <span class="tag-text">{{ item.tag }}</span>
      <span class="tag-count">{{ item.count }}</span>
    </button>
  </div>

  <div v-if="selectedTag" class="tag-articles">
    <h2>{{ selectedTag }} 相关文章</h2>
    <div class="article-list">
      <a
        v-for="(article, i) in allTags.find(t => t.tag === selectedTag).articles"
        :key="i"
        :href="article.link"
        class="article-item"
      >
        <span class="article-category">{{ article.catName }}</span>
        <span class="article-title">{{ article.title }}</span>
      </a>
    </div>
  </div>
</div>

<style scoped>
.tags-page { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
.tags-hero { text-align: center; margin-bottom: 2rem; }
.tags-hero h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem; }
.tags-hero p { color: var(--vp-c-text-2); font-size: 0.95rem; }
.tags-cloud { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; }
.tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}
.tag-btn:hover { border-color: var(--vp-c-brand); background: var(--vp-c-brand-soft, rgba(59,130,246,0.1)); }
.tag-btn.active { border-color: var(--vp-c-brand); background: var(--vp-c-brand); color: #fff; }
.tag-count {
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  min-width: 1.5rem;
  text-align: center;
}
.tag-btn.active .tag-count { background: rgba(255,255,255,0.2); color: #fff; }
.tag-articles { margin-top: 2rem; }
.tag-articles h2 { font-size: 1.2rem; margin-bottom: 1rem; color: var(--vp-c-text-1); }
.article-list { display: flex; flex-direction: column; gap: 0.5rem; }
.article-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: background 0.2s;
}
.article-item:hover { background: var(--vp-c-bg); }
.article-category {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  background: var(--vp-c-brand-soft, rgba(59,130,246,0.1));
  color: var(--vp-c-brand);
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 500;
  min-width: 5rem;
  text-align: center;
}
.article-title { font-size: 0.9rem; color: var(--vp-c-text-1); font-weight: 500; }
</style>
`

fs.writeFileSync(path.join(tagsDir, 'index.md'), tagsIndex)

// Add tags link to nav in config
console.log(`✅ 生成标签云: docs/tags/index.md`)
console.log(`共 ${sortedTags.length} 个标签, ${totalArticles} 篇文章`)
console.log(`\nTop 10 标签:`)
sortedTags.slice(0, 10).forEach(function(e) {
  console.log(`  - ${e[0]} (${e[1].length}篇)`)
})
