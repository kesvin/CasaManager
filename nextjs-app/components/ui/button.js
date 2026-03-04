import * as React from "react"

const buttonVariants = {
  default: "border border-blue-500/40 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 shadow-none",
  destructive: "bg-red-700 text-white hover:bg-red-800 shadow-md dark:shadow-red-900/50",
  edit: "border border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:bg-[rgba(227,20,103,0.42)] hover:border-[rgba(227,20,103,0.42)] shadow-sm",
  actionBlue: "border border-blue-500/40 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 shadow-none",
  success: "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 shadow-none",
  danger: "border border-red-700/30 bg-red-700/10 text-red-300 hover:bg-red-700/20 shadow-none",
  statusActive: "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 shadow-none",
  statusInactive: "border border-red-700/30 bg-red-700/10 text-red-300 hover:bg-red-700/20 shadow-none",
  outline: "border-2 text-[var(--text)] hover:bg-[rgba(227,20,103,0.42)] hover:border-[rgba(227,20,103,0.42)] border-[var(--border)]",
  secondary: "bg-[var(--muted)] bg-opacity-20 text-[var(--text)] hover:bg-opacity-30 shadow-sm",
  ghost: "text-[var(--text)] hover:bg-[rgba(227,20,103,0.42)]",
  interactive: "group relative border-2 border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:bg-[rgba(227,20,103,0.42)] hover:border-[rgba(227,20,103,0.42)] hover:shadow-[0_10px_24px_rgba(227,20,103,0.42)]"
}

const Button = React.forwardRef(({ className = "", variant = "default", children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgba(227,20,103,0.42)] focus:ring-offset-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
  const sizeStyles = "h-9 px-3 text-sm"
  const variantStyles = buttonVariants[variant] || buttonVariants.default
  const isInteractive = variant === "interactive"
  
  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${isInteractive ? "relative overflow-hidden" : ""} ${className}`}
      ref={ref}
      {...props}
    >
      {isInteractive && (
        <>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-[rgba(227,20,103,0.42)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-0 rounded-lg bg-[rgba(227,20,103,0)] blur-xl transition-all duration-300 group-hover:bg-[rgba(227,20,103,0.42)] group-hover:blur-2xl" />
        </>
      )}
      <span className={isInteractive ? "relative z-10" : ""}>
        {children}
      </span>
    </button>
  )
})

Button.displayName = "Button"

export { Button }
