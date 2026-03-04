import * as React from 'react'

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate()

const DatePickerField = React.forwardRef(({ value, onChange, className = '' }, ref) => {
  const today = new Date()
  const fallbackDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const normalizedValue = String(value || fallbackDate)
  const [yearRaw, monthRaw, dayRaw] = normalizedValue.split('-')

  const year = Number(yearRaw) || today.getFullYear()
  const month = Number(monthRaw) || (today.getMonth() + 1)
  const maxDay = getDaysInMonth(year, month)
  const day = Math.min(Number(dayRaw) || today.getDate(), maxDay)

  const currentYear = today.getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index)

  const emitDate = (nextYear, nextMonth, nextDay) => {
    const nextMaxDay = getDaysInMonth(nextYear, nextMonth)
    const safeDay = Math.min(nextDay, nextMaxDay)
    const formattedDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`
    if(typeof onChange === 'function') onChange({ target: { value: formattedDate } })
  }

  const moveMonth = (offset) => {
    const monthIndex = month - 1 + offset
    const targetYear = year + Math.floor(monthIndex / 12)
    const normalizedMonth = ((monthIndex % 12) + 12) % 12 + 1
    emitDate(targetYear, normalizedMonth, day)
  }

  return (
    <div ref={ref} className={`w-full min-w-0 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-2 py-2 ${className}`}>
      <div className="grid grid-cols-[auto,auto,1fr,1fr,1fr,auto] gap-2 items-center">
        <span aria-hidden className="text-sm">📅</span>

        <button
          type="button"
          onClick={() => moveMonth(-1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-xs hover:bg-[rgba(227,20,103,0.22)] transition-colors"
          aria-label="Mes anterior"
        >
          ◀
        </button>

        <select
          value={String(day)}
          onChange={(e) => emitDate(year, month, Number(e.target.value))}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[var(--text)] text-sm"
          aria-label="Día"
        >
          {Array.from({ length: getDaysInMonth(year, month) }, (_, index) => index + 1).map(dayOption => (
            <option key={`day-${dayOption}`} value={String(dayOption)}>{dayOption}</option>
          ))}
        </select>

        <select
          value={String(month)}
          onChange={(e) => emitDate(year, Number(e.target.value), day)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[var(--text)] text-sm"
          aria-label="Mes"
        >
          {MONTHS_ES.map((monthLabel, index) => (
            <option key={`month-${monthLabel}`} value={String(index + 1)}>{monthLabel}</option>
          ))}
        </select>

        <select
          value={String(year)}
          onChange={(e) => emitDate(Number(e.target.value), month, day)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[var(--text)] text-sm"
          aria-label="Año"
        >
          {[...yearOptions].sort((a, b) => b - a).map(yearOption => (
            <option key={`year-${yearOption}`} value={String(yearOption)}>{yearOption}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => moveMonth(1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-xs hover:bg-[rgba(227,20,103,0.22)] transition-colors"
          aria-label="Mes siguiente"
        >
          ▶
        </button>
      </div>
    </div>
  )
})

DatePickerField.displayName = 'DatePickerField'

export { DatePickerField }
