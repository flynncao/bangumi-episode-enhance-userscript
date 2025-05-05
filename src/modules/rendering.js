import Icons from '../static/svg/index'
import { quickSort } from '../utils/index'

/**
 * Render comments based on processed data
 */
export const renderComments = (commentData, userSettings, otherScriptActive) => {
  const { featuredCommentsCount, conservedRow } = commentData

  const sortModeData = userSettings.sortMode || 'reactionCount'

  $('h3:contains("所有精选评论")').remove()

  if (otherScriptActive) {
    renderWithOtherScript(commentData, userSettings, sortModeData)
  } else {
    renderStandalone(commentData, userSettings, sortModeData)
  }

  // Scroll to conserved row if exists
  if (conservedRow) {
    $('html, body').animate(
      {
        scrollTop: $(conservedRow).offset().top,
      },
      2000,
    )
  }

  $('#sortMethodSelect').val(sortModeData)
  if (featuredCommentsCount < 10 && userSettings.hidePlainComments === true) {
    $('#toggleFilteredBtn').click()
  }
}

/**
 * Render comments when another script is active
 */
const renderWithOtherScript = (commentData, userSettings, sortModeData) => {
  const { plainCommentsCount, container, plainCommentElements, featuredCommentElements } =
    commentData

  console.log('Prebroadcast script detected, adapting behavior')

  // Find the toggle element added by the other script
  const otherScriptToggle = $('#comments_seperater').closest('.row_state')

  // Create our state bar
  let stateBar = container.find('.row_state.clearit').not(otherScriptToggle)
  if (stateBar.length === 0) {
    stateBar = $(`<div class="row_state clearit"></div>`)
  }

  // Add our toggle for plain comments
  const hiddenCommentsInfo = $(
    `<div class="filtered" id="toggleFilteredBtn" style="cursor:pointer;color:#48a2c3;">点击展开/折叠剩余${plainCommentsCount}条普通评论</div>`,
  ).click(function () {
    $('#comment_list_plain').slideToggle()
  })
  stateBar.append(hiddenCommentsInfo)

  // Clean up container but preserve the other script's elements
  container.find('.row').each(function () {
    if (!$(this).hasClass('row_reply') && !$(this).hasClass('row_state')) {
      $(this).detach()
    }
  })

  // Add settings button and header
  const header = addHeaderWithSettings(container)

  // Move the prebroadcast toggle to the top
  movePrebroadcastToggleToTop(header, otherScriptToggle)

  // Sort and append featured comments
  sortAndAppendFeaturedComments(featuredCommentElements, container, sortModeData, true)

  // Add our state bar after the featured comments but before the other script's toggle
  // We don't need to add the otherScriptToggle here anymore since we moved it to the top
  container.append(stateBar)

  // Create and add plain comments container
  addPlainCommentsContainer(plainCommentElements, stateBar, userSettings.hidePlainComments, true)
}

/**
 * Render comments in standalone mode (no other script)
 */
const renderStandalone = (commentData, userSettings, sortModeData) => {
  const { plainCommentsCount, container, plainCommentElements, featuredCommentElements } =
    commentData

  // Create state bar
  let stateBar = container.find('.row_state.clearit')
  if (stateBar.length === 0) {
    stateBar = $(`<div class="row_state clearit"></div>`)
  }

  // Add toggle for plain comments
  const hiddenCommentsInfo = $(
    `<div class="filtered" id="toggleFilteredBtn" style="cursor:pointer;color:#48a2c3;">点击展开/折叠剩余${plainCommentsCount}条普通评论</div>`,
  ).click(function () {
    $('#comment_list_plain').slideToggle()
  })
  stateBar.append(hiddenCommentsInfo)

  // Clean up container
  container.find('.row').each(function () {
    if (!$(this).hasClass('row_reply')) {
      $(this).detach()
    }
  })

  // Add settings button and header
  addHeaderWithSettings(container)

  // Sort and append featured comments
  sortAndAppendFeaturedComments(featuredCommentElements, container, sortModeData, false)

  // Add plain comments container
  container.append(stateBar)
  addPlainCommentsContainer(plainCommentElements, container, userSettings.hidePlainComments, false)
}

/**
 * Add header with settings button
 */
const addHeaderWithSettings = (container) => {
  // Add settings button
  const settingBtn = $('<strong></strong>')
    .css({
      display: 'inline-block',
      width: '20px',
      height: '20px',
      transform: 'translate(4px, -3px)',
      cursor: 'pointer',
    })
    .html(Icons.gear)
    .click(() => window.settingsDialog.show())

  // Create header with flex display to accommodate multiple elements
  const header = $('<h3 style="padding:10px;display:flex;width:100%;align-items:center;"></h3>')

  // Add the title text
  const titleText = $('<span>所有精选评论</span>')

  // Add elements to header
  header.append(titleText)
  header.append(settingBtn)

  // Add header to container
  container.append(header)

  // Return the header element so we can add more elements to it if needed
  return header
}

/**
 * Sort and append featured comments
 */
const sortAndAppendFeaturedComments = (
  featuredCommentElements,
  container,
  sortModeData,
  checkHidden,
) => {
  // Sort featured comments
  const trinity = {
    reactionCount() {
      return quickSort(featuredCommentElements, 'score')
    },
    replyCount() {
      return quickSort(featuredCommentElements, 'commentsCount')
    },
    oldFirst() {
      return quickSort(featuredCommentElements, 'timestampNumber', true)
    },
    newFirst() {
      return quickSort(featuredCommentElements, 'timestampNumber')
    },
  }

  const sortedElements = trinity[sortModeData]()

  // Get all comments that are hidden by the other script if needed
  const hiddenByOtherScript = checkHidden
    ? $('.row.row_reply.clearit').filter(function () {
        return $(this).css('display') === 'none'
      })
    : []

  // Append featured comments
  sortedElements.forEach(function (element) {
    if (checkHidden) {
      // Skip comments that are already hidden by the other script
      const isHidden =
        hiddenByOtherScript.filter(function () {
          return this.id === element.element.id
        }).length > 0

      if (!isHidden) {
        container.append($(element.element))
      }
    } else {
      container.append($(element.element))
    }
  })

  return sortedElements
}

/**
 * Add plain comments container
 */
const addPlainCommentsContainer = (
  plainCommentElements,
  container,
  hidePlainComments,
  checkHidden,
) => {
  // Create plain comments container
  const plainCommentsContainer = $('<div id="comment_list_plain" style="margin-top:2rem;"></div>')
  if (hidePlainComments) {
    plainCommentsContainer.hide()
  }

  // Get all comments that are hidden by the other script if needed
  const hiddenByOtherScript = checkHidden
    ? $('.row.row_reply.clearit').filter(function () {
        return $(this).css('display') === 'none'
      })
    : []

  // Add plain comments to container
  plainCommentElements.forEach(function (element) {
    if (checkHidden) {
      // Skip comments that are already hidden by the other script
      const isHidden =
        hiddenByOtherScript.filter(function () {
          return this.id === element.element.id
        }).length > 0

      if (!isHidden) {
        plainCommentsContainer.append($(element.element))
      }
    } else {
      plainCommentsContainer.append($(element.element))
    }
  })

  container.append(plainCommentsContainer)
}

/**
 * Move the prebroadcast toggle to the top of the page
 */
const movePrebroadcastToggleToTop = (header, otherScriptToggle) => {
  if (otherScriptToggle && otherScriptToggle.length > 0) {
    // Find the separator element
    const separator = otherScriptToggle.find('#comments_seperater')

    if (separator.length > 0) {
      // Clone the separator with its event handlers
      const clonedSeparator = separator.clone(true)

      // Style it to fit in the header
      clonedSeparator.css({
        'margin-left': '10px',
        display: 'inline-block',
      })

      // Add it to the header
      header.append(clonedSeparator)

      // Remove the original toggle from the DOM to prevent duplicates
      otherScriptToggle.remove()

      // Remove any other separators that might exist
      $('.row_state').each(function () {
        if (
          $(this).find('#comments_seperater').length > 0 &&
          !$(this).find('#comments_seperater').closest('h3').length
        ) {
          $(this).remove()
        }
      })
    }
  }
}
