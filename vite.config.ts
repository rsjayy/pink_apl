import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import {
  EDITOR_PATH,
  SET_PASSWORD_PATH,
  PAGE_IDS,
  PAGES,
} from './src/routes.ts'

/**
 * GitHub Pages only serves files that exist, so a refresh on /pink_apl/oc
 * would 404. This writes a copy of index.html for every page in routes.ts
 * (oc/index.html, info/lore/index.html, ...), plus a 404.html that the app
 * turns into its "page not found" screen, and the editor's pages, hidden from
 * search engines.
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

      for (const id of PAGE_IDS) {
        const { path } = PAGES[id]
        if (path === '/') continue
        this.emitFile({
          type: 'asset',
          fileName: `${path.slice(1)}/index.html`,
          source: html,
        })
      }
      for (const path of [EDITOR_PATH, SET_PASSWORD_PATH]) {
        this.emitFile({
          type: 'asset',
          fileName: `${path.slice(1)}/index.html`,
          source: html.replace(
            '</head>',
            '<meta name="robots" content="noindex, nofollow" />\n  </head>',
          ),
        })
      }
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: html,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/pink_apl/
  base: '/pink_apl/',
  plugins: [react(), tailwindcss(), pageHtml()],
  define: {
    // The editor compares this with its own save times; see editor/savedCopies.ts.
    __BUILD_TIME__: JSON.stringify(Date.now()),
  },
})
