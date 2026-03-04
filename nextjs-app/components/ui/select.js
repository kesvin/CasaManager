import * as React from "react"

const Select = React.forwardRef(({ className = "", value, defaultValue, ...props }, ref) => {
  const effectiveValue = value ?? defaultValue
  const isPlaceholder = effectiveValue === '' || String(effectiveValue) === 'all'

  return (
    <select
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      className={`flex w-full rounded-lg border-2 bg-[var(--card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(227,20,103,0.42)] focus:border-[rgba(227,20,103,0.42)] disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none cursor-pointer shadow-sm ${isPlaceholder ? 'is-placeholder text-[var(--muted)]' : 'text-[var(--text)]'} ${className}`}
      style={{ borderColor: 'var(--border)' }}
      {...props}
    />
  )
})

Select.displayName = "Select"

export { Select }
