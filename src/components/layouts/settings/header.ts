// create a noname header, emit a even to control the movement of whole setting dialog when dragging this header

export function createNonameHeader() {
  const nonameHeader = document.createElement('div')
  nonameHeader.className = 'padding-row'
  nonameHeader.addEventListener('mousedown', (event: MouseEvent) => {
    event.preventDefault()

    const container = event.target as HTMLElement
    const parentContainer = container.parentElement

    if (!parentContainer)
      return

    // Store initial positions
    const startX = event.clientX
    const startY = event.clientY
    const startLeft = Number.parseInt(window.getComputedStyle(parentContainer).left) || 0
    const startTop = Number.parseInt(window.getComputedStyle(parentContainer).top) || 0

    // When we start dragging, remove the centering transform
    if (parentContainer.style.transform.includes('translate')) {
      const rect = parentContainer.getBoundingClientRect()
      parentContainer.style.transform = 'none'
      parentContainer.style.left = `${rect.left}px`
      parentContainer.style.top = `${rect.top}px`
    }

    const handleMouseMove = (event: MouseEvent) => {
      // Calculate how far the mouse has moved
      const deltaX = event.clientX - startX
      const deltaY = event.clientY - startY

      // Apply that delta to the original position
      const newLeft = startLeft + deltaX
      const newTop = startTop + deltaY

      // Get container dimensions
      const containerWidth = parentContainer.offsetWidth
      const containerHeight = parentContainer.offsetHeight

      // Check if new position would be outside viewport
      if (
        newLeft < containerWidth / 2
        || newTop < containerHeight / 2
        || newLeft + containerWidth / 2 > window.innerWidth
        || newTop + containerHeight / 2 > window.innerHeight
      ) {
        // Cancel the movement by not updating position
        return
      }

      // If we get here, the position is safe, so update it
      parentContainer.style.left = `${newLeft}px`
      parentContainer.style.top = `${newTop}px`
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  })
  return nonameHeader
}
