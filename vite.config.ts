import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import {
  NOT_FOUND_TITLE,
  PAGE_IDS,
  PAGES,
  documentTitle,
  pageTitle,
} from './src/routes.ts'

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * GitHub Pages only serves files that exist, so a refresh on /pink_apl/oc
 * would 404. This writes a copy of index.html for every page in routes.ts
 * (oc/index.html, info/lore/index.html, ...) with that page's title, plus a
 * 404.html that the app turns into its "page not found" screen.
 */
function pageHtml(): Plugin {
  return {
    name: 'page-html',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const index = bundle['index.html']
      if (index?.type !== 'asset') {
        this.error('page-html: index.html was not in the bundle')
      }
      const html = String(index.source)
      const withTitle = (title: string) =>
        html.replace(
          /<title>.*?<\/title>/,
          `<title>${escapeHtml(title)}</title>`,
        )

      for (const id of PAGE_IDS) {
        const { path } = PAGES[id]
        if (path === '/') {
          index.source = withTitle(pageTitle(id))
        } else {
          this.emitFile({
            type: 'asset',
            fileName: `${path.slice(1)}/index.html`,
            source: withTitle(pageTitle(id)),
          })
        }
      }
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: withTitle(documentTitle(NOT_FOUND_TITLE)),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/pink_apl/
  base: '/pink_apl/',
  plugins: [react(), tailwindcss(), pageHtml()],
})
