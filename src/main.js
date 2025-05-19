import { createSettingMenu } from './components/layouts/settings/index'
import { BGM_EP_REGEX, BGM_GROUP_REGEX } from './constants/index'
import processComments from './modules/comments'
import Icons from './static/svg/index'
import Storage from './storage/index'
import { quickSort } from './utils/index'
;(async function () {
  if (!BGM_EP_REGEX.test(location.href) && !BGM_GROUP_REGEX.test(location.href)) {
    return
  }
  Storage.init({
    hidePlainComments: true,
    minimumFeaturedCommentLength: 15,
    maxFeaturedComments: 99,
    sortMode: 'reactionCount',
    stickyMentioned: false,
    hidePremature: false,
  })
  window.BCE = window.BCE || {}

  const userSettings = {
    hidePlainComments: Storage.get('hidePlainComments'),
    minimumFeaturedCommentLength: Storage.get('minimumFeaturedCommentLength'),
    maxFeaturedComments: Storage.get('maxFeaturedComments'),
    sortMode: Storage.get('sortMode'),
    stickyMentioned: Storage.get('stickyMentioned'),
    hidePremature: Storage.get('hidePremature'),
  }
  const sortModeData = userSettings.sortMode || 'reactionCount'
  /**
   * Main
   */
  let {
    plainCommentsCount,
    featuredCommentsCount,
    container,
    plainCommentElements,
    featuredCommentElements,
    preservedRow,
    lastRow,
  } = processComments(userSettings)
  let stateBar = container.find('.row_state.clearit')
  if (stateBar.length === 0) {
    stateBar = $(`<div id class="row_state clearit"></div>`)
  }
  // Create toggle button with appropriate text based on current state
  const toggleButtonText = userSettings.hidePlainComments
    ? `点击展开剩余${plainCommentsCount}条普通评论`
    : `点击折叠${plainCommentsCount}条普通评论`

  const hiddenCommentsInfo = $(
    `<div class="filtered" id="toggleFilteredBtn" style="cursor:pointer;color:#48a2c3;">${toggleButtonText}</div>`,
  ).click(function () {
    $('#comment_list_plain').slideToggle()
    // Update button text when toggled
    const isHidden = $('#comment_list_plain').is(':hidden')
    $(this).text(
      isHidden
        ? `点击展开剩余${plainCommentsCount}条普通评论`
        : `点击折叠${plainCommentsCount}条普通评论`,
    )
  })
  stateBar.append(hiddenCommentsInfo)
  container.find('.row').detach()
  const menuBarCSSProperties = {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    transform: 'translate(0, -3px)',
    margin: '0 0 0 5px',
    cursor: 'pointer',
  }
  const settingBtn = $('<strong></strong>')
    .css(menuBarCSSProperties)
    .html(Icons.gear)
    .click(() => window.BCE.settingsDialog.show())

  console.log('lastRow', lastRow)
  const jumpToNewestBtn = $('<strong></strong>')
    .css(menuBarCSSProperties)
    .html(Icons.newest)
    .click(() => {
      // Scroll to last row when user clicks the jump to newest button
      $('#toggleFilteredBtn').click()
      $('html, body').animate({
        scrollTop: $(lastRow).offset().top,
      })
      const hash = lastRow.id
      if (window.history.pushState && window.history.replaceState && window.history.state) {
        window.history.replaceState(null, null, `#${hash}`)
      }
    })
  const showPrematureBtn = $('<strong></strong>')
    .css(menuBarCSSProperties)
    .html(Icons.eyeOpen)
    .click(() => {})
  container.append(
    $('<h3 style="padding:10px;display:flex;width:100%;align-items:center;">所有精选评论</h3>')
      .append(settingBtn)
      .append(showPrematureBtn)
      .append(jumpToNewestBtn),
  )

  const trinity = {
    reactionCount() {
      featuredCommentElements = quickSort(featuredCommentElements, 'score')
    },
    replyCount() {
      featuredCommentElements = quickSort(featuredCommentElements, 'commentsCount')
    },
    oldFirst() {
      featuredCommentElements = quickSort(featuredCommentElements, 'timestampNumber', true)
    },
    newFirst() {
      featuredCommentElements = quickSort(featuredCommentElements, 'timestampNumber')
    },
  }
  trinity[sortModeData]()
  /**
   * Append components
   */
  featuredCommentElements.forEach(function (element) {
    container.append($(element.element))
  })
  plainCommentElements.forEach(function (element) {
    container.append($(element.element))
  })
  container.append(stateBar)
  // Create container for plain comments
  const plainCommentsContainer = $('<div id="comment_list_plain" style="margin-top:2rem;"></div>')

  // Only hide plain comments if the setting is enabled
  if (userSettings.hidePlainComments) {
    plainCommentsContainer.hide()
  }

  // Add plain comments to the container
  plainCommentElements.forEach(function (element) {
    plainCommentsContainer.append($(element.element))
  })

  container.append(plainCommentsContainer)
  // Scroll to conserved row if exists
  if (preservedRow) {
    $('html, body').animate({
      scrollTop: $(preservedRow).offset().top,
    })
  }
  $('#sortMethodSelect').val(sortModeData)
  // Auto-expand plain comments if there are few featured comments and plain comments are hidden
  if (featuredCommentsCount < 10 && userSettings.hidePlainComments === true) {
    $('#toggleFilteredBtn').click()
  }
  createSettingMenu(userSettings, BGM_EP_REGEX.test(location.href))
  // control center
  $(document).on('settingsSaved', () => {
    location.reload()
  })
})()
