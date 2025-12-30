import type { HTMLAttributes, PropsWithChildren } from 'react'

export function Card({
  children,
  className,
  ...rest
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={['card', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

export function CardPad({
  children,
  className,
  ...rest
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={['cardPad', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}


