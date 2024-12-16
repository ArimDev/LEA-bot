// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import LeaLayout from './LeaLayout.vue'
import './style.css'
import ScriptX from 'vue-scriptx'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: LeaLayout,
  enhanceApp({ app, router, siteData }) {
    app.use(ScriptX)
    // ...
  }
}
