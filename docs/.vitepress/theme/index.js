// https://vitepress.dev/guide/custom-theme
import DefaultTheme from 'vitepress/theme'
import LeaLayout from './LeaLayout.vue'
import './style.css'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: LeaLayout,
}
