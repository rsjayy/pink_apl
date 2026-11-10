// Turns a Pinterest pin link (pin.it short link or full URL) into direct image
// links the owner can paste into image fields. Pinterest blocks browsers from
// reading its pages cross-site, so the lookup goes through a small proxy API.
// Same tool and wording as the Kataa editor's "Get Pinterest image link" tab.

import { useState } from 'react'
import { Button, Field, inputClass } from './fields'

// #region Config
const PIN_API_BASE = 'https://09176645.xyz/pin-image-urls'

interface PinImages {
  source: string
  thumbnail: string
  original: string
}

type Message = { tone: 'success' | 'error'; text: string } | null
// #endregion

// #region Main flow
export function PinterestTool() {
  const [pinUrl, setPinUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PinImages | null>(null)
  const [message, setMessage] = useState<Message>(null)

  const fetchPinImage = async () => {
    if (!pinUrl.trim()) {
      setMessage({ tone: 'error', text: 'Enter a Pinterest short link' })
      return
    }

    setLoading(true)
    setResult(null)
    setMessage(null)

    try {
      const apiUrl = `${PIN_API_BASE}/?url=${encodeURIComponent(pinUrl.trim())}`
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)
      setResult(await response.json())
      setMessage({ tone: 'success', text: 'Got it' })
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Fetch failed'
      setMessage({ tone: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border-2 border-bubblegum bg-white/70 p-4">
      <Field
        label="Pinterest short link"
        hint="On a pin: Share, then Copy link."
      >
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={pinUrl}
            onChange={(event) => setPinUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              fetchPinImage()
            }}
            placeholder="https://pin.it/6LL2aVThw"
            className={`${inputClass} flex-[1_1_200px]`}
            disabled={loading}
          />
          <Button variant="primary" onClick={fetchPinImage} disabled={loading}>
            {loading ? 'Loading…' : 'Get image links'}
          </Button>
        </div>
      </Field>

      {message && (
        <p
          role="status"
          className={`text-sm ${message.tone === 'success' ? 'text-green-700' : 'text-red-700'}`}
        >
          {message.text}
        </p>
      )}

      {result && !loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageResult
            title="Thumbnail"
            alt="Thumbnail preview"
            url={result.thumbnail}
          />
          <ImageResult
            title="Full size image"
            alt="Full size image preview"
            url={result.original}
          />
        </div>
      )}
    </div>
  )
}
// #endregion

// #region Helpers
function ImageResult({
  title,
  alt,
  url,
}: {
  title: string
  alt: string
  url: string
}) {
  const [copyMessage, setCopyMessage] = useState('')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopyMessage('Copied')
    } catch {
      setCopyMessage('Copy failed')
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <img
        src={url}
        alt={alt}
        className="block h-auto max-w-full rounded-lg border-2 border-bubblegum"
      />
      <div className="flex gap-2">
        <input type="text" value={url} readOnly className={inputClass} />
        <Button onClick={copy}>Copy</Button>
      </div>
      {copyMessage && <p className="text-xs text-neutral-500">{copyMessage}</p>}
    </div>
  )
}
// #endregion
