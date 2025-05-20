export function createButton(
  { id, text, icon, className, onClick, disabled = false },
  userSettings = {},
) {
  // Create button with base class
  const button = $('<strong></strong>').html(icon).addClass(className)[0]

  button.id = id

  if (
    Object.prototype.hasOwnProperty.call(userSettings, 'showText') &&
    userSettings.showText === true
  ) {
    // add a text named "显示标题' following the svg icon with font size  21px 21px
    const textNode = document.createTextNode(text)
    const span = document.createElement('span')
    span.append(textNode)
    button.append(span)
  }

  button.addEventListener('click', onClick)
  button.disabled = disabled

  return button
}
