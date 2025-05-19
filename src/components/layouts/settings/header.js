// create a noname header, emit a even to control the movement of whole setting dialog when dragging this header

export const createNonameHeader = () => {
  const nonameHeader = document.createElement('div')
  nonameHeader.className = 'padding-row'
  nonameHeader.addEventListener('mousedown', (event) => {
    event.preventDefault()

    const container = event.target.parentElement

    // Store initial positions
    const startX = event.clientX
    const startY = event.clientY
    const startLeft = Number.parseInt(window.getComputedStyle(container).left) || 0
    const startTop = Number.parseInt(window.getComputedStyle(container).top) || 0

    // When we start dragging, remove the centering transform
    if (container.style.transform.includes('translate')) {
      const rect = container.getBoundingClientRect()
      container.style.transform = 'none'
      container.style.left = `${rect.left}px`
      container.style.top = `${rect.top}px`
    }

    const handleMouseMove = (event) => {
      // Calculate how far the mouse has moved
      const deltaX = event.clientX - startX
      const deltaY = event.clientY - startY

      // Apply that delta to the original position
      const newLeft = startLeft + deltaX
      const newTop = startTop + deltaY

      // Get container dimensions
      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight

      // Check if new position would be outside viewport
      if (
        newLeft < containerWidth / 2 ||
        newTop < containerHeight / 2 ||
        newLeft + containerWidth / 2 > window.innerWidth ||
        newTop + containerHeight / 2 > window.innerHeight
      ) {
        // Cancel the movement by not updating position
        return
      }

      // If we get here, the position is safe, so update it
      container.style.left = `${newLeft}px`
      container.style.top = `${newTop}px`
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', handleMouseMove)
    })
  })
  return nonameHeader
}
