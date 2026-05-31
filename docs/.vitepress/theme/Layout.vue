<script setup>
import DefaultTheme from 'vitepress/theme'
import { useRoute, useData } from 'vitepress'
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'

const { Layout } = DefaultTheme
const route = useRoute()
const { page, site, theme } = useData()

// 侧边栏折叠状态
const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

// 文章内 TOC — 从 page.headers 提取 h2/h3
const tocItems = computed(() => {
  const headers = page.value?.headers || []
  if (headers.length < 3) return [] // 标题少于 3 个不显示 TOC

  const result = []
  for (const h of headers) {
    if (h.level === 2) {
      result.push({
        level: 2,
        title: h.title,
        slug: h.slug,
        children: [],
      })
    } else if (h.level === 3 && result.length > 0) {
      result[result.length - 1].children.push({
        level: 3,
        title: h.title,
        slug: h.slug,
      })
    }
  }
  return result.length < 3 ? [] : result
})

// 最近更新标识 — 近 7 天内更新的页面
const isRecentlyUpdated = computed(() => {
  if (!page.value?.lastUpdated) return false
  try {
    const updated = new Date(page.value.lastUpdated)
    const now = new Date()
    const diffDays = (now - updated) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  } catch {
    return false
  }
})

// Breadcrumb path computation
const breadcrumbs = computed(() => {
  const path = route.data?.relativePath || ''
  if (!path) return []
  const parts = path.replace(/\\/g, '/').split('/').filter(Boolean)
  const crumbs = [{ label: '首页', link: '/' }]
  let accumulated = ''
  for (const part of parts) {
    accumulated += '/' + part
    // Remove .md for leaf
    const display = part.replace(/\.md$/, '')
    const isLeaf = part.endsWith('.md')
    crumbs.push({
      label: displayName(display),
      link: isLeaf ? undefined : accumulated.replace(/\/index$/, '') + '/',
    })
  }
  return crumbs
})

const categoryNames = {
  whitepaper: '行业百科',
  standards: '施工规范',
  models: '装修模式',
  crafts: '施工工艺',
  pricing: '报价预算',
  inspection: '验收清单',
  materials: '材料选购',
  pitfalls: '避坑指南',
  market: '市场行情',
  enterprises: '装企排行',
}

function displayName(name) {
  // Check if it's a category
  if (categoryNames[name]) return categoryNames[name]
  // Convert kebab-case to readable Chinese (fallback)
  return name.replace(/-/g, ' ')
}

function categoryName(cat) {
  return categoryNames[cat] || cat
}

// Back to top + reading progress
const showBackToTop = ref(false)
const progressWidth = ref(0)
let ticking = false

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
    progressWidth.value = pct
    showBackToTop.value = scrollTop > 400
    ticking = false
  })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

// Reset scroll state on route change
watch(() => route.path, () => {
  showBackToTop.value = false
  progressWidth.value = 0
})

// 相关文章 — 基于 tags 匹配，无标签时回退到同分类
const articleTags = computed(() => {
  const tags = page.value?.frontmatter?.tags || []
  return Array.isArray(tags) ? tags.slice(0, 8) : []
})

const relatedArticles = computed(() => {
  const currentPage = route.data?.relativePath || ''
  if (!currentPage) return []

  const parts = currentPage.replace(/\\/g, '/').split('/')
  const currentCategory = parts[0] || ''
  const currentTags = page.value?.frontmatter?.tags || []
  const pages = site.value?.pages || []

  const scored = pages
    .filter(p => {
      const rel = (p.relativePath || '').replace(/\\/g, '/')
      return rel !== currentPage && rel.endsWith('.md')
    })
    .map(p => {
      const pTags = p.frontmatter?.tags || []
      const pCat = p.frontmatter?.category || ''
      // 计算匹配分数
      let score = 0
      if (Array.isArray(currentTags) && currentTags.length > 0) {
        score = currentTags.filter(t => pTags.includes(t)).length
      } else {
        // 无标签时按分类匹配
        score = pCat === currentCategory ? 1 : 0
      }
      // 同分类加分
      if (pCat === currentCategory) score += 0.5
      return { page: p, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => ({
      title: x.page.title || '未命名',
      link: '/' + (x.page.relativePath || '').replace(/\\/g, '/').replace(/\.md$/, '').replace(/\/index$/, ''),
      category: x.page.frontmatter?.category || '',
    }))

  // 修复链接：确保 index 页正确
  return scored.map(a => ({
    ...a,
    link: a.link.endsWith('/') ? a.link : a.link + '/',
  }))
})
</script>

<template>
  <Layout>
    <!-- 阅读进度条 -->
    <div class="reading-progress-bar" :style="{ width: progressWidth + '%' }" />

    <!-- 面包屑（仅文章页显示） -->
    <template #doc-before>
      <div>
        <nav class="breadcrumb-nav" v-if="breadcrumbs.length > 1">
          <template v-for="(crumb, i) in breadcrumbs" :key="i">
            <span v-if="i > 0" class="breadcrumb-sep">›</span>
            <a v-if="crumb.link && crumb.link !== route.path" :href="crumb.link">{{ crumb.label }}</a>
            <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
          </template>
        </nav>

        <!-- 文章内 TOC（h2/h3 锚点目录，标题≥3 个时显示） -->
        <nav v-if="tocItems.length > 0" class="inline-toc" :class="{ open: sidebarOpen }">
          <div class="inline-toc-header" @click="toggleSidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <span>目录</span>
            <svg class="inline-toc-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </div>
          <ul class="inline-toc-list">
            <li v-for="item in tocItems" :key="item.slug">
              <a :href="'#' + item.slug" class="toc-link toc-h2">{{ item.title }}</a>
              <ul v-if="item.children.length > 0" class="toc-sub-list">
                <li v-for="child in item.children" :key="child.slug">
                  <a :href="'#' + child.slug" class="toc-link toc-h3">{{ child.title }}</a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </template>

    <!-- 更新时间徽章 -->
    <template #doc-after>
      <div v-if="page.lastUpdated" class="last-updated-badge" :class="{ 'recent': isRecentlyUpdated }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <span>最后更新于 {{ page.lastUpdated }}</span>
        <span v-if="isRecentlyUpdated" class="recent-badge">最近更新</span>
      </div>

      <!-- 文章标签 -->
      <div v-if="articleTags.length > 0" class="article-tags">
        <a href="/tags/" class="tags-label">标签</a>
        <a v-for="tag in articleTags" :key="tag" :href="'/tags/' + encodeURIComponent(tag)" class="tag-link">
          {{ tag }}
        </a>
      </div>

      <!-- 反馈按钮 -->
      <div class="feedback-section">
        <div class="feedback-title">这篇内容对你有帮助吗？</div>
        <div class="feedback-buttons">
          <button class="feedback-btn" onclick="window._hmt && _hmt.push(['_trackEvent', 'feedback', 'helpful'])"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;vertical-align:-2px;margin-right:4px"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>有帮助</button>
          <button class="feedback-btn" onclick="window._hmt && _hmt.push(['_trackEvent', 'feedback', 'not-helpful'])"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;vertical-align:-2px;margin-right:4px"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>需要改进</button>
        </div>
        <div class="feedback-follow">
          <p>关注装修知识库，获取更多专业指导</p>
        </div>
      </div>

      <!-- 相关推荐 -->
      <div v-if="relatedArticles.length > 0" class="related-section">
        <div class="related-title">推荐阅读</div>
        <div class="related-list">
          <a v-for="(article, i) in relatedArticles" :key="i" :href="article.link" class="related-item">
            <span class="related-category">{{ categoryName(article.category) }}</span>
            <span class="related-name">{{ article.title }}</span>
          </a>
        </div>
      </div>
    </template>

    <!-- 页脚 -->
    <template #footer-after>
      <div class="footer-contact">
        <p class="footer-contact-text">
          如有疑问或需要专业咨询，请联系：<br>
          邮箱：contact@zhuangxiuzhishi.cn
        </p>
      </div>
    </template>
  </Layout>

  <!-- 返回顶部按钮 -->
  <button class="back-to-top-btn" :class="{ visible: showBackToTop }" @click="scrollToTop" title="返回顶部">
    ↑
  </button>
</template>

<style>
/* 面包屑容器 - 在文章内容区顶部 */
.breadcrumb-nav {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  padding: 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.breadcrumb-nav a {
  color: var(--vp-c-brand);
  text-decoration: none;
}
.breadcrumb-nav a:hover {
  text-decoration: underline;
}
.breadcrumb-sep {
  color: var(--vp-c-text-3);
  margin: 0 0.1rem;
}
.breadcrumb-current {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

/* 反馈区 */
.feedback-section {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-align: center;
}
.feedback-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}
.feedback-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.feedback-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.feedback-btn:hover {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-brand-light);
  color: #fff;
}
.feedback-follow {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

/* 更新时间徽章 */
.last-updated-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  padding: 0.3rem 0.8rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  margin-top: 0.5rem;
}
.last-updated-badge svg {
  width: 14px;
  height: 14px;
}

/* 文章标签 */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
}
.tags-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-decoration: none;
  margin-right: 0.3rem;
}
.tag-link {
  display: inline-block;
  font-size: 0.78rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: all 0.2s;
}
.tag-link:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  background: var(--vp-c-brand-soft, rgba(59,130,246,0.1));
}

/* 相关推荐 */
.related-section {
  margin: 1.5rem 0;
  padding: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.related-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--vp-c-text-1);
}
.related-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.related-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  background: var(--vp-c-bg);
  text-decoration: none;
  transition: background 0.2s;
}
.related-item:hover {
  background: var(--vp-c-bg-soft);
}
.related-category {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  background: var(--vp-c-brand-soft, rgba(59, 130, 246, 0.1));
  color: var(--vp-c-brand);
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 500;
}
.related-name {
  font-size: 0.88rem;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

/* 页脚联系信息 */
.footer-contact {
  padding: 1rem 0;
  text-align: center;
  border-top: 1px solid var(--vp-c-divider);
}
.footer-contact-text {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.6;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .back-to-top-btn {
    bottom: 1.2rem;
    right: 1.2rem;
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  .breadcrumb-nav {
    font-size: 0.78rem;
  }
}
</style>
