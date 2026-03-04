import * as React from "react"

const Badge = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-blue-600 text-white shadow-md",
    secondary: "bg-[var(--card)] border border-[var(--border)] text-[var(--text)] shadow-md",
    success: "bg-green-600 text-white shadow-md",
    warning: "bg-yellow-600 text-white shadow-md",
    destructive: "bg-red-700 text-white shadow-md"
  }
  
  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide ${variants[variant]} ${className}`}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

export { Badge }
