import * as React from "react"

const Label = React.forwardRef(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`block text-sm font-semibold text-[var(--text)] ${className}`}
    {...props}
  />
))

Label.displayName = "Label"

export { Label }
