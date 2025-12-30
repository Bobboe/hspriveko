import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Variant = 'default' | 'primary' | 'danger'

export function Button({
  variant = 'default',
  className,
  children,
  ...rest
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>) {
  const variantClass =
    variant === 'primary'
      ? 'btnPrimary'
      : variant === 'danger'
        ? 'btnDanger'
        : ''

  return (
    <button className={['btn', variantClass, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  )
}


