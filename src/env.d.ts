/** When this copy of the site was built (ms since 1970). Set in vite.config.ts. */
declare const __BUILD_TIME__: number

interface ImportMetaEnv {
  /** Point the editor at another static-page-editors server, e.g. a local one. */
  readonly VITE_EDITOR_API_URL?: string
  readonly VITE_EDITOR_PROJECT_ID?: string
}
