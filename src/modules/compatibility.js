/**
 * Check if the prebroadcast script is active
 */
export const isPrebroadcastScriptActive = () => {
  return $('#comments_seperater').length > 0
}

/**
 * Wait for the other script to finish processing
 */
export const waitForPrebroadcastScript = async () => {
  // If the script isn't active, return immediately
  if (!isPrebroadcastScriptActive()) {
    return false
  }

  // Create a promise that resolves when the other script is done
  return new Promise((resolve) => {
    const pollInterval = 50 // ms
    const maxWaitTime = 5000 // ms
    let elapsedTime = 0

    const checkCompletion = () => {
      // Check if the toggle function exists and has completed
      const toggleExists = typeof window.toggleComments === 'function'
      const isComplete = toggleExists && window.toggleCommentsComplete === true

      // Check if the DOM has been modified by the other script
      const domModified =
        $('#comments_seperater').length > 0 &&
        $('.row.row_reply.clearit').filter(function () {
          return $(this).css('display') === 'none'
        }).length > 0

      if (isComplete || domModified || elapsedTime >= maxWaitTime) {
        resolve(domModified || isComplete)
        return
      }

      elapsedTime += pollInterval
      setTimeout(checkCompletion, pollInterval)
    }

    checkCompletion()
  })
}

/**
 * Handle click events for the prebroadcast toggle
 * This ensures our script works correctly with the other script's dynamic DOM changes
 */
export const setupPrebroadcastToggleHandler = () => {
  // Create a flag to track if we're currently handling a click
  let isHandlingClick = false

  // Set up a delegated event handler for all comments_seperater elements
  $(document).on('click', '#comments_seperater', function (event) {
    // Prevent handling multiple clicks at once
    if (isHandlingClick) return
    isHandlingClick = true

    // Store the current button text to determine the toggle state
    const currentText = $(this).text()

    // After the click, there might be a new separator added
    setTimeout(() => {
      // Find all separators
      const allSeparators = $('[id="comments_seperater"]')

      // Keep only the one in our header, remove all others
      const headerSeparator = $('h3:contains("所有精选评论") #comments_seperater')

      if (headerSeparator.length > 0) {
        // Update the header separator text
        headerSeparator.text(
          currentText.includes('展开')
            ? currentText.replace('展开', '折叠')
            : currentText.replace('折叠', '展开'),
        )

        // Remove all other separators
        allSeparators.each(function () {
          if (!$(this).closest('h3').length) {
            $(this).closest('.row_state').remove()
          }
        })
      } else {
        // If we don't have a header separator yet, move one there
        const firstSeparator = allSeparators.first()
        if (firstSeparator.length > 0) {
          // Clone the separator with its event handlers
          const clonedSeparator = firstSeparator.clone(true)

          // Style it to fit in the header
          clonedSeparator.css({
            'margin-left': '10px',
            display: 'inline-block',
          })

          // Add it to the header
          $('h3:contains("所有精选评论")').append(clonedSeparator)

          // Remove the original
          firstSeparator.closest('.row_state').remove()
        }
      }

      // Reset the flag
      isHandlingClick = false
    }, 200) // Slightly longer delay to ensure the DOM has been updated
  })

  // Also set up a MutationObserver to catch any new separators added by the script
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any new separators were added
        const newSeparators = $('#comments_seperater').filter(function () {
          return !$(this).closest('h3').length
        })

        if (newSeparators.length > 0) {
          // Get the header separator
          const headerSeparator = $('h3:contains("所有精选评论") #comments_seperater')

          if (headerSeparator.length > 0) {
            // Update the header separator text
            headerSeparator.text(newSeparators.first().text())

            // Remove the new separators
            newSeparators.each(function () {
              $(this).closest('.row_state').remove()
            })
          } else {
            // If we don't have a header separator yet, move one there
            const firstSeparator = newSeparators.first()

            // Clone the separator with its event handlers
            const clonedSeparator = firstSeparator.clone(true)

            // Style it to fit in the header
            clonedSeparator.css({
              'margin-left': '10px',
              display: 'inline-block',
            })

            // Add it to the header
            $('h3:contains("所有精选评论")').append(clonedSeparator)

            // Remove the original
            firstSeparator.closest('.row_state').remove()
          }
        }
      }
    })
  })

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Store the observer on the window object so it doesn't get garbage collected
  window.commentsMutationObserver = observer
}
