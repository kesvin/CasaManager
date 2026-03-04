export default function AppLogo({ size = 44, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo CasaManager"
    >
      <g style={{ color: 'var(--white)' }}>
        <path
          d="M52 22.5C47.9 16.35 40.9 12.3 32.95 12.3C20.3 12.3 10.05 22.55 10.05 35.2C10.05 47.85 20.3 58.1 32.95 58.1C40.8 58.1 47.7 54.15 51.85 48.15"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="M18 39.5L27.4 31L35.4 34.8L45.8 22.9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <circle cx="18" cy="39.5" r="2" fill="currentColor" />
        <circle cx="27.4" cy="31" r="2" fill="currentColor" />
        <circle cx="35.4" cy="34.8" r="2" fill="currentColor" />
        <circle cx="45.8" cy="22.9" r="2" fill="currentColor" />

        <path
          d="M43.4 23.4H51V31"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <rect x="16" y="45.5" width="4" height="8.8" rx="2" fill="currentColor" />
        <rect x="24" y="41.7" width="4" height="12.6" rx="2" fill="currentColor" />
        <rect x="32" y="44.3" width="4" height="10" rx="2" fill="currentColor" />
      </g>
    </svg>
  )
}
