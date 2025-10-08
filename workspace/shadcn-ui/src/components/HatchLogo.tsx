import { cn } from '@/lib/utils'

type HatchLogoProps = {
  className?: string
  color?: string
  wordmark?: boolean
}

const DEFAULT_COLOR = '#1A6DF0'

export function HatchLogo({ className, color = DEFAULT_COLOR, wordmark = true }: HatchLogoProps) {
  return (
    <span
      className={cn('select-none leading-none tracking-tight', className)}
      style={{
        color,
        fontFamily: '"Nunito", "Poppins", "Inter", "Helvetica Neue", sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        fontSize: '1.75rem',
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.05em'
      }}
    >
      <span style={{ fontWeight: 800 }}>H</span>
      {wordmark && <span style={{ fontWeight: 700 }}>atch</span>}
    </span>
  )
}

export default HatchLogo
