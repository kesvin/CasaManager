import * as React from "react"

// Simple modal without external Radix dependency (can be enhanced later with @radix-ui/react-dialog)
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div onClick={e => e.stopPropagation()} className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl w-full max-w-sm mx-4">
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ className = "", children, ...props }) => (
  <div className={`p-6 ${className}`} {...props}>{children}</div>
)

const DialogHeader = ({ className = "", children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 pb-4 border-b border-[var(--border)] ${className}`} {...props}>{children}</div>
)

const DialogTitle = ({ className = "", children, ...props }) => (
  <h2 className={`text-lg font-semibold text-[var(--text)] ${className}`} {...props}>{children}</h2>
)

const DialogFooter = ({ className = "", children, ...props }) => (
  <div className={`flex justify-end gap-2 pt-4 border-t border-[var(--border)] ${className}`} {...props}>{children}</div>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter }
