class CustomCheckboxContainer {
  constructor(id, label, checked) {
    this.id = id
    this.label = label
    this.checked = checked
    this.input = null
  }

  createElement() {
    if (this.element) {
      return this.element
    }
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.id = this.id
    checkbox.checked = this.checked
    this.input = checkbox
    return checkbox
  }

  createLabel() {
    const label = document.createElement('label')
    label.htmlFor = this.id
    label.textContent = this.label
    return label
  }

  getContainer() {
    const container = document.createElement('div')
    container.className = 'checkbox-container'
    container.append(this.createElement())
    container.append(this.createLabel())
    return container
  }

  getInput() {
    return this.input
  }
}

export { CustomCheckboxContainer }
