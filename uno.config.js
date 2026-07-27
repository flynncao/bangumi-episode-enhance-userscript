import presetIcons from '@unocss/preset-icons'

export const unoIconClasses = [
  'i-lucide-arrow-down-up',
  'i-lucide-calendar-days',
  'i-lucide-check',
  'i-lucide-chevrons-down',
  'i-lucide-chevrons-up',
  'i-lucide-circle-check',
  'i-lucide-circle-x',
  'i-lucide-clock-3',
  'i-lucide-eye',
  'i-lucide-filter',
  'i-lucide-info',
  'i-lucide-list',
  'i-lucide-loader-circle',
  'i-lucide-settings',
  'i-lucide-triangle-alert',
  'i-lucide-user-round',
  'i-lucide-x',
]

export default {
  presets: [
    presetIcons({
      mode: 'mask',
      warn: true,
      processor: (cssObject) => {
        // Shared mask and sizing declarations live in .bce-icon to avoid
        // repeating them for every generated icon in the userscript bundle.
        for (const property of Object.keys(cssObject)) {
          if (property !== '--un-icon') {
            delete cssObject[property]
          }
        }
      },
    }),
  ],
  safelist: unoIconClasses,
}
