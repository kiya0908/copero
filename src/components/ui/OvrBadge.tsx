import { AnimatedNumber } from './AnimatedNumber'

type Props = {
  overall: number
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

function tierClass(ovr: number): string {
  if (ovr >= 90) return 'ovr-legend'
  if (ovr >= 80) return 'ovr-gold'
  if (ovr >= 70) return 'ovr-silver'
  return 'ovr-bronze'
}

export function OvrBadge({ overall, size = 'md', animate = true }: Props) {
  const sizeCls =
    size === 'lg'
      ? 'h-14 w-14 text-2xl'
      : size === 'sm'
        ? 'h-8 w-8 text-sm'
        : 'h-11 w-11 text-lg'

  return (
    <div
      className={`flex ${sizeCls} items-center justify-center rounded-lg font-display font-extrabold text-white ${tierClass(overall)}`}
      title={`OVR ${overall}`}
    >
      {animate ? <AnimatedNumber value={overall} /> : Math.round(overall)}
    </div>
  )
}
