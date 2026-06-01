/**
 * 统一构建脚本 — VitePress 构建 + Sitemap/robots.txt 生成
 * 替换原来的两步模式，确保 sitemap/robots 作为构建流程的必需环节
 * 任何一步失败都会中断部署，在 Cloudflare 日志中暴露错误
 */
import { execSync } from 'child_process'
import { SitemapStream, streamToPromise } from 'sitemap'
import { createWriteStream, existsSync, readdirSync } from 'fs'
import { join, resolve, posix, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = resolve(__dirname, '..')
const DIST_DIR = join(DOCS_DIR, '.vitepress', 'dist')
const BASE_URL = 'https://zhuangxiuzhishi.cn'

// Step 1: VitePress build
console.log('[build] Starting VitePress build...')
try {
  execSync('npx vitepress build docs', {
    cwd: DOCS_DIR,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' },
  })
} catch (err) {
  console.error('[build] VitePress build FAILED')
  process.exit(1)
}
console.log('[build] VitePress build complete.')

// Step 2: Verify dist exists
if (!existsSync(DIST_DIR)) {
  console.error(`[post-build] ERROR: dist directory not found: ${DIST_DIR}`)
  process.exit(1)
}

// Step 3: Collect URLs and generate sitemap
function collectUrls(dir, basePath = '') {
  const urls = []
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'assets') continue
      const subUrls = collectUrls(fullPath, posix.join(basePath, entry.name))
      urls.push(...subUrls)
      if (existsSync(join(fullPath, 'index.html'))) {
        urls.push({ url: posix.join('/', basePath, '/') })
      }
    } else if (entry.name.endsWith('.html') && entry.name !== '404.html' && entry.name !== 'index.html') {
      const pageName = entry.name.replace('.html', '')
      urls.push({ url: posix.join('/', basePath, pageName + '.html') })
    }
  }
  return urls
}

const allUrls = collectUrls(DIST_DIR)
const seen = new Set()
const unique = allUrls.filter(u => {
  if (seen.has(u.url)) return false
  seen.add(u.url)
  return true
})

console.log(`[post-build] Generating sitemap with ${unique.length} URLs...`)

const sitemapPath = join(DIST_DIR, 'sitemap.xml')
const stream = new SitemapStream({ hostname: BASE_URL })
const writeStream = createWriteStream(sitemapPath)
stream.pipe(writeStream)

for (const u of unique) {
  stream.write({ url: u.url, changefreq: 'weekly', priority: u.url === '/' ? 1.0 : 0.7 })
}
stream.end()

await new Promise((resolve, reject) => {
  writeStream.on('finish', resolve)
  writeStream.on('error', reject)
})
console.log(`[post-build] ✓ Sitemap written to ${sitemapPath}`)

const robotsPath = join(DIST_DIR, 'robots.txt')
const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`
await new Promise((resolve, reject) => {
  const ws = createWriteStream(robotsPath)
  ws.on('finish', resolve)
  ws.on('error', reject)
  ws.end(robotsContent)
})
console.log(`[post-build] ✓ robots.txt written to ${robotsPath}`)

// Step 4: Verify output files exist
if (!existsSync(sitemapPath)) {
  console.error('[post-build] ERROR: sitemap.xml was not generated')
  process.exit(1)
}
if (!existsSync(robotsPath)) {
  console.error('[post-build] ERROR: robots.txt was not generated')
  process.exit(1)
}

console.log('[build] ✓ All done. Files verified.')
