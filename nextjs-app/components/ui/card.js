import * as React from "react"

const Card = React.forwardRef(({ className = "", variant = "default", style, ...props }, ref) => {
  const isForm = variant === 'form'

  return (
    <div
      ref={ref}
      className={`rounded-xl bg-[var(--card)] border transition-all duration-300 ${className}`}
      style={{
        background: 'rgba(0, 0, 0, 0.82)',
        borderColor: 'var(--border)',
        boxShadow: isForm
          ? '0 2px 12px rgba(0, 0, 0, 0.08), inset 0 3px 0 0 var(--text)'
          : '0 2px 12px rgba(0, 0, 0, 0.08)',
        ...style
      }}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-4 sm:p-6 border-b ${className}`} style={{ borderColor: 'var(--border)' }} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h2 ref={ref} className={`text-lg font-bold leading-none tracking-tight`} style={{ color: 'var(--text)' }} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`text-sm ${className}`} style={{ color: 'var(--muted)' }} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-4 sm:p-6 ${className}`} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`flex items-center p-4 sm:p-6 pt-0 ${className}`} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
