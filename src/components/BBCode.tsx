import BBCodeRenderer from '@bbob/react'
import presetReact from '@bbob/preset-react'

const preset = presetReact.extend((tags) => ({
  ...tags,
  br: () => ({ tag: 'br', content: null }),
}))

const plugins = [preset()]

/**
 * Text written in the editor's BBCode box ([b], [i], [u], [s], [color],
 * [url]). A blank line shows as a gap between paragraphs.
 */
export function BBCode({ text }: { text: string }) {
  // BBob doesn't turn newlines into <br>, so turn them into a tag first.
  const withBreaks = text.replace(/\r\n/g, '\n').split('\n').join('[br]')
  return (
    <BBCodeRenderer plugins={plugins} container="div">
      {withBreaks}
    </BBCodeRenderer>
  )
}
