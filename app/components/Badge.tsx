// app/components/Badge.tsx
import React from 'react'

export function Badge({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        'border border-gray-200 bg-white text-gray-700',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export default Badge
