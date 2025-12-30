import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function ghPagesBase() {
  // In GitHub Actions, this env var is like "username/repo"
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (process.env.GITHUB_ACTIONS && repo) return `/${repo}/`
  return '/'
}

// https://vite.dev/config/
export default defineConfig({
  // Makes the app work on https://username.github.io/<repo>/
  base: ghPagesBase(),
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.svg'],
      manifest: {
        name: 'Privat ekonomi',
        short_name: 'Budget',
        description: 'Privat ekonomi med budget per kategori (lokalt på enheten).',
        theme_color: '#0f1a14',
        background_color: '#0b0f0d',
        display: 'standalone',
        // Relative so it works both locally and under /<repo>/
        scope: '.',
        start_url: '.',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // Relative so it works under /<repo>/ as well
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
