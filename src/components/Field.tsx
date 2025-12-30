import type { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes } from 'react'

export function Field({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <label className="stack" style={{ gap: 6 }}>
      <div className="label">{label}</div>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={['input', props.className].filter(Boolean).join(' ')} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={['select', props.className].filter(Boolean).join(' ')} />
}


