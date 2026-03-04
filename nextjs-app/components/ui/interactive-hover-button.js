'use client'

import React, { useState } from 'react'

const InteractiveHoverButton = React.forwardRef(({ 
  children = "Pásame el cursor",
  className = "", 
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      ref={ref}
      className={`group relative inline-flex h-12 w-full items-center justify-center rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-6 font-medium text-[var(--text)] transition-all duration-300 hover:bg-[rgba(227,20,103,0.42)] hover:border-[rgba(227,20,103,0.42)] hover:shadow-[0_10px_24px_rgba(227,20,103,0.42)] sm:w-auto ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-[rgba(227,20,103,0.42)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 rounded-lg bg-[rgba(227,20,103,0)] blur-xl transition-all duration-300 group-hover:bg-[rgba(227,20,103,0.42)] group-hover:blur-2xl" />
    </button>
  )
})

InteractiveHoverButton.displayName = "InteractiveHoverButton"

export { InteractiveHoverButton }
