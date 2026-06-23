import React from 'react'

interface TopBarProps {
  children: React.ReactNode
}

export function TopBar({ children }: TopBarProps) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border shrink-0"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
    >
      {children}
    </div>
  )
}
