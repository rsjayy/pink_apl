import { useLayoutEffect, useRef } from 'react'
import { SCEditor, type SCEditorInstance } from 'sceditor-react'

// Only formatting the site's renderer (components/BBCode.tsx) understands.
// SCEditor's size and list buttons write BBCode it doesn't.
const TOOLBAR = 'bold,italic,underline,strike|color|link,unlink|source'

/**
 * SCEditor (https://www.sceditor.com) in BBCode mode. Its scripts load from
 * unpkg the first time the editor needs them.
 *
 * Also syncs on `nodechanged` and `blur`: SCEditor's own change event only
 * fires on keyup, so clicking Bold and then Save would save the old text.
 * (Same fix as kataa-homescreen's editor.)
 */
export function BBCodeEditor({
  value,
  onChange,
  height = 360,
}: {
  value: string
  onChange: (value: string) => void
  height?: number
}) {
  const onChangeRef = useRef(onChange)
  useLayoutEffect(() => {
    onChangeRef.current = onChange
  })

  return (
    // SCEditor sizes itself in pixels; keep it from pushing the form sideways.
    <div className="max-w-full overflow-x-auto rounded-lg border-2 border-bubblegum bg-white [&_.sceditor-container]:max-w-full [&_.sceditor-container]:border-0">
      <SCEditor
        format="bbcode"
        toolbar={TOOLBAR}
        value={value}
        onChange={onChange}
        height={height}
        width="100%"
        options={{ resizeWidth: false }}
        onReady={(instance: SCEditorInstance) => {
          instance.bind('nodechanged blur', () => {
            const next = instance.val()
            if (typeof next === 'string') onChangeRef.current(next)
          })
        }}
      />
    </div>
  )
}
