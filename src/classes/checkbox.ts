class CustomCheckboxContainer {
  id: string
  label: string
  description: string
  iconSvg: string
  checked: boolean
  input: HTMLInputElement | null
  element: HTMLElement | null
  container: HTMLElement | null

  constructor(
    id: string,
    label: string,
    description: string,
    iconSvg: string,
    checked: boolean,
  ) {
    this.id = id
    this.label = label
    this.description = description
    this.iconSvg = iconSvg
    this.checked = checked
    this.input = null
    this.element = null
    this.container = null
  }

  createElement(): HTMLInputElement {
    if (this.input) {
      return this.input
    }
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.id = this.id
    checkbox.className = 'bce-checkbox-input'
    checkbox.checked = this.checked
    this.input = checkbox
    return checkbox
  }

  getContainer(): HTMLElement {
    if (this.container) {
      return this.container
    }

    const wrapper = document.createElement('label')
    wrapper.className = `bce-checkbox-wrapper${this.checked ? ' checked' : ''}`
    wrapper.htmlFor = this.id

    // Icon
    const iconDiv = document.createElement('div')
    iconDiv.className = 'bce-checkbox-icon'
    iconDiv.innerHTML = this.iconSvg

    // Content
    const contentDiv = document.createElement('div')
    contentDiv.className = 'bce-checkbox-content'

    const labelSpan = document.createElement('span')
    labelSpan.className = 'bce-checkbox-label'
    labelSpan.textContent = this.label

    const descSpan = document.createElement('span')
    descSpan.className = 'bce-checkbox-description'
    descSpan.textContent = this.description

    contentDiv.appendChild(labelSpan)
    contentDiv.appendChild(descSpan)

    // Custom checkbox visual
    const checkDiv = document.createElement('div')
    checkDiv.className = 'bce-checkbox-check'
    checkDiv.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`

    // Hidden input
    const input = this.createElement()

    // Assemble
    wrapper.appendChild(iconDiv)
    wrapper.appendChild(contentDiv)
    wrapper.appendChild(checkDiv)
    wrapper.appendChild(input)

    // Event listener for visual state
    input.addEventListener('change', () => {
      this.checked = input.checked
      if (input.checked) {
        wrapper.classList.add('checked')
      }
      else {
        wrapper.classList.remove('checked')
      }
    })

    this.container = wrapper
    return wrapper
  }

  isChecked(): boolean {
    return this.input?.checked ?? this.checked
  }

  setChecked(checked: boolean): void {
    this.checked = checked
    if (this.input) {
      this.input.checked = checked
    }
    if (this.container) {
      if (checked) {
        this.container.classList.add('checked')
      }
      else {
        this.container.classList.remove('checked')
      }
    }
  }

  getInput(): HTMLInputElement | null {
    return this.input
  }
}

export { CustomCheckboxContainer }
