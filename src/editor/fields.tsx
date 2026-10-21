import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

export const inputClass =
  'w-full min-w-0 rounded-lg border-2 border-bubblegum bg-white px-3 py-2 text-base outline-none focus:border-hotpink disabled:opacity-60'

const BUTTON_VARIANTS = {
  normal: 'border-bubblegum bg-white hover:border-hotpink',
  primary: 'border-hotpink bg-hotpink text-white hover:bg-hotpink/85',
  quiet: 'border-transparent bg-transparent hover:bg-blush',
}

export function Button({
  variant = 'normal',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS
}) {
  return (
    <button
      type={type}
      className={`shrink-0 rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <input
      className={inputClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function ImageInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  /** The size that looks sharp on the page. */
  hint?: string
  value: string
  onChange: (value: string) => void
}) {
  const [broken, setBroken] = useState<string | null>(null)
  const src = value.trim()

  return (
    <div className="flex items-start gap-3">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-bubblegum bg-blush text-center text-xs text-neutral-500">
        {!src ? (
          'No image'
        ) : broken === src ? (
          "Can't load"
        ) : (
          <img
            src={src}
            alt=""
            className="size-full object-cover"
            onError={() => setBroken(src)}
          />
        )}
      </div>
      <div className="flex-1">
        <Field label={label} hint={hint}>
          <TextInput value={value} onChange={onChange} />
        </Field>
      </div>
    </div>
  )
}
