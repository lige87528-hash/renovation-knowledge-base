// post-build.js — generate sitemap.xml and robots.txt after VitePress build
import { SitemapStream, streamToPromise } from 'sitemap'
import { createWriteStream, readdirSync, existsSync } from 'fs'
import { join, resolve, posix } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = resolve(__dirname, '..', '.vitepress', 'dist')
const BASE_URL = 'https://zhuangxiuzhishi.cn'

function collectUrls(dir, basePath = '') {
  const urls = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'assets') continue // skip JS/CSS assets
      const subUrls = collectUrls(fullPath, posix.join(basePath, entry.name))
      urls.push(...subUrls)
      // Directory index = page
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

async function generateSitemap() {
  if (!existsSync(DIST_DIR)) {
    console.error('Dist directory not found:', DIST_DIR)
    process.exit(1)
  }

  const allUrls = collectUrls(DIST_DIR)

  // Deduplicate
  const seen = new Set()
  const unique = allUrls.filter(u => {
    if (seen.has(u.url)) return false
    seen.add(u.url)
    return true
  })

  console.log(`Generating sitemap with ${unique.length} URLs...`)

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
  console.log(`Sitemap written to ${sitemapPath}`)

  // robots.txt
  const robotsPath = join(DIST_DIR, 'robots.txt')
  await createWriteStream(robotsPath).end(
    `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`
  )
  console.log(`robots.txt written to ${robotsPath}`)
}

generateSitemap().catch(err => { console.error(err); process.exit(1) })
