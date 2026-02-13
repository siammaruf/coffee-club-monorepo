import { cn } from '@/lib/utils'

interface DecorativeOrnamentProps {
  dark?: boolean
  className?: string
}

export function DecorativeOrnament({ dark = false, className }: DecorativeOrnamentProps) {
  return (
    <svg
      width="80"
      height="16"
      viewBox="0 0 80 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block', className)}
      aria-hidden="true"
    >
      {/* Left line */}
      <line
        x1="0"
        y1="8"
        x2="28"
        y2="8"
        stroke={dark ? '#C4903E' : '#A0782C'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Coffee bean shape */}
      <ellipse
        cx="40"
        cy="8"
        rx="6"
        ry="5"
        fill={dark ? '#C4903E' : '#A0782C'}
        opacity="0.8"
      />
      <path
        d="M40 3C39 5.5 39 10.5 40 13"
        stroke={dark ? '#1A110A' : '#FDF8F3'}
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Right line */}
      <line
        x1="52"
        y1="8"
        x2="80"
        y2="8"
        stroke={dark ? '#C4903E' : '#A0782C'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
