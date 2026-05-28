<script setup>
import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-after>
      <div class="feedback-section">
        <div class="feedback-title">这篇内容对你有帮助吗？</div>
        <div class="feedback-buttons">
          <button class="feedback-btn" onclick="window._hmt && _hmt.push(['_trackEvent', 'feedback', 'helpful'])">👍 有帮助</button>
          <button class="feedback-btn" onclick="window._hmt && _hmt.push(['_trackEvent', 'feedback', 'not-helpful'])">👎 需要改进</button>
        </div>
        <div class="feedback-follow">
          <p>关注装修知识库，获取更多专业指导</p>
        </div>
      </div>
    </template>
    <template #footer-after>
      <div class="footer-contact">
        <p class="footer-contact-text">
          如有疑问或需要专业咨询，请联系：<br>
          邮箱：contact@zhuangxiuzhishi.cn
        </p>
      </div>
    </template>
  </Layout>
</template>

<style>
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
</style>
