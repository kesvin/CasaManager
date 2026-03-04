'use client'

import React, { useState, useEffect } from 'react'

const ThemeToggle = React.forwardRef(({ onToggle, theme, ...props }, ref) => {
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    setIsAnimating(true)
    if (onToggle) onToggle()
    setTimeout(() => setIsAnimating(false), 600)
  }

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      ref={ref}
      onClick={handleToggle}
      className="theme-toggle relative w-14 h-7 rounded-full border border-[var(--border)] bg-[var(--card)] shadow-md transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-black group"
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      {...props}
    >
      {/* Animated background */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-r transition-all duration-500 ${
        isDark 
          ? 'from-blue-500 to-purple-600 opacity-100' 
          : 'from-yellow-300 to-orange-400 opacity-0'
      }`} />
      
      {/* Sliding button */}
      <div
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white dark:bg-[var(--card)] shadow-lg transition-all duration-500 flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0.5'
        } ${isAnimating ? 'scale-90' : 'scale-100'}`}
      >
        {/* Sun icon */}
        <svg
          className={`absolute w-4 h-4 transition-all duration-500 ${
            isDark 
              ? 'opacity-0 scale-0 rotate-180' 
              : 'opacity-100 scale-100 rotate-0'
          } text-yellow-500`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Moon icon */}
        <svg
          className={`absolute w-4 h-4 transition-all duration-500 ${
            isDark 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-0 rotate-180'
          } text-blue-400`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-blue-400 to-purple-500 blur-lg" />
    </button>
  )
})

ThemeToggle.displayName = 'ThemeToggle'

export { ThemeToggle }
