export type IconName
  = | 'arrow-down-up'
    | 'calendar-days'
    | 'check'
    | 'chevrons-down'
    | 'chevrons-up'
    | 'circle-check'
    | 'circle-x'
    | 'clock-3'
    | 'eye'
    | 'filter'
    | 'info'
    | 'list'
    | 'loader-circle'
    | 'settings'
    | 'triangle-alert'
    | 'user-round'
    | 'x'

export function icon(name: IconName, extraClass = ''): string {
  const className = extraClass
    ? `bce-icon i-lucide-${name} ${extraClass}`
    : `bce-icon i-lucide-${name}`

  return `<span class="${className}" aria-hidden="true"></span>`
}
