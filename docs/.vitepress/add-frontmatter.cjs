/**
 * 批量为所有 .md 文章添加 category 和 tags frontmatter
 * 运行: node docs/.vitepress/add-frontmatter.js
 */
const fs = require('fs')
const path = require('path')

const docsDir = path.join(__dirname, '..')

// 分类 → 标签映射（根据目录自动推断 tags）
const categoryTags = {
  whitepaper: ['装修白皮书', '行业趋势', '装修指南'],
  standards: ['施工规范', '国家标准', '施工工艺'],
  models: ['装修模式', '全包', '半包', '清包', '整装'],
  crafts: ['工种工艺', '施工工艺', '装修工艺'],
  pricing: ['装修报价', '预算控制', '装修费用'],
  inspection: ['验收标准', '验收清单', '装修验收'],
  materials: ['材料选购', '装修材料', '品牌推荐'],
  pitfalls: ['装修避坑', '合同陷阱', '施工陷阱'],
  market: ['市场分析', '装修行情', '城市数据'],
  enterprises: ['龙头企业', '装修公司', '行业分析'],
}

// 文件名 → 额外标签映射
const fileTagMap = {
  'GB50210': ['GB50210', '建筑装饰装修工程质量验收标准'],
  'GB50327': ['GB50327', '住宅装饰装修工程施工规范'],
  'GB50325': ['GB50325', '民用建筑工程室内环境污染控制规范'],
  'GB50222': ['GB50222', '建筑内部装修设计防火规范'],
  'GB50242': ['GB50242', '建筑给水排水及采暖工程施工质量验收规范'],
  'GB50303': ['GB50303', '建筑电气工程施工质量验收规范'],
  'hydro-electric': ['水电施工', '水电验收', '水电布线'],
  'masonry': ['泥瓦施工', '瓷砖铺贴', '防水'],
  'carpentry': ['木作施工', '吊顶', '木作工艺'],
  'painting': ['油漆施工', '墙面处理', '涂料'],
  'installation': ['安装工程', '地板安装', '橱柜安装'],
  'tiles': ['瓷砖选购', '地砖', '墙砖'],
  'flooring': ['地板选购', '木地板', '复合地板'],
  'bathroom': ['卫浴选购', '马桶', '淋浴'],
  'paint': ['涂料选购', '乳胶漆', '环保涂料'],
  'doors': ['室内门', '门窗选购'],
  'pre-renovation': ['装修前', '装修准备', '避坑指南'],
  'contract-signing': ['合同签约', '合同条款', '付款方式'],
  'construction-pitfalls': ['施工中', '施工猫腻', '增项'],
  'material-authentication': ['材料鉴别', '真伪鉴别'],
  'acceptance-after-sales': ['验收', '售后服务', '维权'],
  'smarthome': ['智能家居', '智能装修'],
  'environmental': ['环保装修', '甲醛治理'],
  'styles': ['装修风格', '现代简约', '北欧风'],
  'renovation': ['旧房翻新', '二手房装修'],
  'checklist': ['验收清单', 'Checklist'],
  'comparison': ['模式对比', '装修方式选择'],
  'budget-tips': ['预算技巧', '省钱技巧'],
  'purchase-checklist': ['采购清单', '主材', '辅材'],
  'supervision': ['装修监理', '第三方监理'],
  'design': ['设计阶段', '设计避坑'],
  'contract': ['合同管理', '合同范本'],
}

function getTags(relativePath) {
  const parts = relativePath.replace(/\\/g, '/').split('/')
  const category = parts[0]
  const fileName = path.basename(parts[parts.length - 1], '.md')
  const dirname = parts.length > 1 ? parts[parts.length - 2] : ''

  const tags = new Set()

  // 添加分类标签
  if (categoryTags[category]) {
    categoryTags[category].forEach(t => tags.add(t))
  }

  // 添加文件特定标签
  const key = fileName
  if (fileTagMap[key]) {
    fileTagMap[key].forEach(t => tags.add(t))
  }

  // 如果文件名和目录名不同，也查目录
  if (dirname !== category && fileTagMap[dirname]) {
    fileTagMap[dirname].forEach(t => tags.add(t))
  }

  return Array.from(tags)
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  // 跳过 index.md 首页（已有独立配置）
  const basename = path.basename(filePath)
  if (basename === 'index.md' && filePath.replace(docsDir, '').split(path.sep).filter(Boolean).length <= 2) {
    // 保留分类 index.md（如 /standards/index.md），只跳过根目录 index.md
    const rel = path.relative(docsDir, filePath)
    const depth = rel.split(path.sep).length
    if (depth === 2) return { skipped: true, reason: 'category index' }
    if (depth === 1) return { skipped: true, reason: 'root index' }
  }

  const relPath = path.relative(docsDir, filePath)
  const parts = relPath.replace(/\\/g, '/').split('/')
  const category = parts[0] || ''

  // 解析已有 frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  let existingFm = {}
  let body = content

  if (fmMatch) {
    const fmText = fmMatch[1]
    body = content.slice(fmMatch[0].length)
    // 简单解析 key: value
    const lines = fmText.split('\n')
    let currentKey = null
    let currentLines = []
    for (const line of lines) {
      const kvMatch = line.match(/^(\w[\w_]*):\s*(.*)/)
      if (kvMatch) {
        if (currentKey && currentLines.length > 0) {
          existingFm[currentKey] = currentLines.join('\n').trim()
        }
        currentKey = kvMatch[1]
        currentLines = [kvMatch[2]]
      } else if (currentKey && line.startsWith('  ') || line.startsWith('-')) {
        currentLines.push(line)
      } else if (currentKey) {
        existingFm[currentKey] = currentLines.join('\n').trim()
        currentKey = null
        currentLines = []
      }
    }
    if (currentKey) {
      existingFm[currentKey] = currentLines.join('\n').trim()
    }

    // 解析数组值（去掉引号）
    for (const key in existingFm) {
      const val = existingFm[key]
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          existingFm[key] = JSON.parse(val)
        } catch { /* ignore */ }
      }
    }
  }

  // 合并 tags 和 category
  const newTags = getTags(relPath)
  const existingTags = Array.isArray(existingFm.tags) ? existingFm.tags : []
  const mergedTags = [...new Set([...existingTags, ...newTags])]

  // 如果没有 change，跳过
  if (existingFm.category === category && arraysEqual(existingTags.sort(), mergedTags.sort())) {
    return { skipped: true, reason: 'already has tags' }
  }

  // 构建新 frontmatter
  const newFm = { ...existingFm }
  newFm.category = category
  newFm.tags = mergedTags

  // 序列化 frontmatter
  let fmStr = '---\n'
  for (const [key, value] of Object.entries(newFm)) {
    if (Array.isArray(value)) {
      fmStr += `${key}: [${value.map(v => `"${v}"`).join(', ')}]\n`
    } else {
      fmStr += `${key}: ${value}\n`
    }
  }
  fmStr += '---'

  const newContent = fmStr + '\n' + body.replace(/^\n+/, '')

  fs.writeFileSync(filePath, newContent, 'utf-8')
  return { modified: true, tags: mergedTags }
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

// Walk docs directory
function walkDir(dir) {
  let results = []
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      results = results.concat(walkDir(filePath))
    } else if (file.endsWith('.md') && !file.endsWith('.bak')) {
      results.push(filePath)
    }
  }
  return results
}

const mdFiles = walkDir(docsDir)
let modified = 0
let skipped = 0

console.log(`开始处理 ${mdFiles.length} 个 Markdown 文件...\n`)

for (const file of mdFiles) {
  const result = processFile(file)
  if (result.modified) {
    modified++
    const rel = path.relative(docsDir, file)
    console.log(`✅ ${rel} → tags: ${result.tags.slice(0, 3).join(', ')}...`)
  } else {
    skipped++
  }
}

console.log(`\n完成！修改 ${modified} 个文件，跳过 ${skipped} 个文件`)
