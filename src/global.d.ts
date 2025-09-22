interface ChiiLib {
  ukagaka: {
    addPanelTab: (config: {
      tab: string
      label: string
      type: string
      config: Array<{
        title: string
        name: string
        type: 'custom' | 'tab'
        defaultValue: any
        getCurrentValue: () => any
        onChange: (value: any) => void
        options: Array<{
          value: string
          label: string
        }>
      }>
    }) => any
  }
}

declare global {
  const chiiLib: ChiiLib
  const $: any
}

export {}
