// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import LeaLayout from './LeaLayout.vue'
import './style.css'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: LeaLayout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
