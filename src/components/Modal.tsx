import type { PropsWithChildren } from 'react'

export function Modal({
  open,
  title,
  onClose,
  children,
}: PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
}>) {
  if (!open) return null

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modalSheet">
        <div className="rowBetween" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 750 }}>{title}</div>
          <button className="btn" onClick={onClose} aria-label="Stäng">
            Stäng
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}


