import * as React from "react"

const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`block w-full min-w-0 rounded-lg border-2 bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm ${className}`}
    style={{ borderColor: 'var(--border)' }}
    {...props}
  />
))

Input.displayName = "Input"

export { Input }
