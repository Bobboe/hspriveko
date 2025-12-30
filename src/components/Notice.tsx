import type { PropsWithChildren } from 'react'

export function Notice({
  variant = 'default',
  children,
}: PropsWithChildren<{ variant?: 'default' | 'error' | 'success' }>) {
  const cls =
    variant === 'error'
      ? 'notice noticeError'
      : variant === 'success'
        ? 'notice noticeSuccess'
        : 'notice'

  return <div className={cls}>{children}</div>
}


