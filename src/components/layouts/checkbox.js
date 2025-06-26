export function createCheckbox(
  { id, label, className, onChange, checked, disabled = false },
  userSettings = {},
) {
  // Create the checkbox container
  const labelEl = document.createElement('label')
  labelEl.className = className

  // Create the checkbox input
  const inputEl = document.createElement('input')
  inputEl.type = 'checkbox'
  inputEl.id = id
  inputEl.checked = checked

  // Create the custom checkmark span
  const checkmarkEl = document.createElement('span')
  checkmarkEl.className = 'bct-checkmark'

  // Create the label text span
  const textSpan = document.createElement('span')
  textSpan.textContent = label

  // Append elements to the label
  labelEl.append(inputEl)
  labelEl.append(checkmarkEl)
  labelEl.append(textSpan)

  inputEl.addEventListener('change', onChange)
  inputEl.disabled = disabled

  return labelEl
}
