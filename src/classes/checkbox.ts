class CustomCheckboxContainer {
  id: string
  label: string
  checked: boolean
  input: HTMLInputElement | null
  element: HTMLElement | null

  constructor(id: string, label: string, checked: boolean) {
    this.id = id
    this.label = label
    this.checked = checked
    this.input = null
    this.element = null
  }

  createElement(): HTMLInputElement {
    if (this.element) {
      return this.input as HTMLInputElement
    }
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.id = this.id
    checkbox.checked = this.checked
    this.input = checkbox
    return checkbox
  }

  createLabel(): HTMLLabelElement {
    const label = document.createElement('label')
    label.htmlFor = this.id
    label.textContent = this.label
    return label
  }

  getContainer(): HTMLDivElement {
    const container = document.createElement('div')
    container.className = 'checkbox-container'
    container.append(this.createElement())
    container.append(this.createLabel())
    return container
  }

  getInput(): HTMLInputElement | null {
    return this.input
  }
}

export { CustomCheckboxContainer }
