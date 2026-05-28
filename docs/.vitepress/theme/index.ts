import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'
import Layout from './Layout.vue'
import './style.css'

export default {
  ...DefaultTheme,
  Layout: Layout,
  setup() {
    onMounted(() => {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {})
        })
      }
    })
  }
}
