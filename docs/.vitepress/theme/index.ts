import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'

export default {
  extends: DefaultTheme,
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
