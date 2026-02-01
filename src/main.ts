import type { CommentElement, UserSettings } from './types/index'

import { createSettingMenu } from './components/layouts/settings/index'
import { BGM_EP_REGEX, BGM_GROUP_REGEX } from './constants/index'
import processComments from './modules/comments'
import butterupStyles from './static/css/butterup.css'
import styles from './static/css/styles.css'
import butterup from './static/js/butterup'
import Icons from './static/svg/index'
import { initCloudSettings, syncFromCloud } from './storage/cloudSettings'
import Storage from './storage/index'
import { quickSort } from './utils/index';

(async function () {
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

  const userSettings: UserSettings = {
    hidePlainComments: Storage.get('hidePlainComments'),
    minimumFeaturedCommentLength: Storage.get('minimumFeaturedCommentLength'),
    maxFeaturedComments: Storage.get('maxFeaturedComments'),
    sortMode: Storage.get('sortMode'),
    stickyMentioned: Storage.get('stickyMentioned'),
    hidePremature: Storage.get('hidePremature'),
  }

  // Sync from CloudStorage if available (before UI creation)
  syncFromCloud(userSettings)

  const sortModeData = userSettings.sortMode || 'reactionCount'
  ;(() => {
    const butterupStyleEl = document.createElement('style')
    butterupStyleEl.textContent = String(butterupStyles)
    document.head.append(butterupStyleEl)
    const styleEl = document.createElement('style')
    styleEl.textContent = String(styles)
    document.head.append(styleEl)
  })()

  /**
   * Process comments and prepare the container
   */
  let {
    plainCommentsCount,
    featuredCommentsCount,
    container,
    plainCommentElements,
    featuredCommentElements,
    preservedRow,
    lastRow,
    isLastRowFeatured,
  } = processComments(userSettings)
  console.log('lastRow', lastRow)
  console.log('featuredCommentElements', featuredCommentElements)
  let stateBar = container.find('.row_state.clearit') as JQuery<HTMLElement>
  if (stateBar.length === 0) {
    stateBar = $(`<div id class="row_state clearit"></div>`)
  }
  // Create toggle button with appropriate text based on current state
  const toggleButtonText = userSettings.hidePlainComments
    ? `点击展开剩余${plainCommentsCount}条普通评论`
    : `点击折叠${plainCommentsCount}条普通评论`

  const toggleHiddenCommentsInfoText = () => {
    const curText = $(hiddenCommentsInfo).text()
    if (curText.includes('展开')) {
      hiddenCommentsInfo.text(`点击折叠${plainCommentsCount}条普通评论`)
    }
    else {
      hiddenCommentsInfo.text(`点击展开剩余${plainCommentsCount}条普通评论`)
    }
  }

  const hiddenCommentsInfo = $(
    `<div class="filtered" id="toggleFilteredBtn" style="cursor:pointer;color:#48a2c3;">${toggleButtonText}</div>`,
  ).click(() => {
    const commentList = $('#comment_list_plain')
    commentList.slideToggle()
    toggleHiddenCommentsInfoText()
  })

  stateBar.append(hiddenCommentsInfo)
  container.find('.row').detach()
  const menuBarCSSProperties: JQuery.PlainObject = {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    transform: 'translate(0, -3px)',
    margin: '0 0 0 5px',
    cursor: 'pointer',
  }
  /**
   * Button event handlers
   */

  const settingBtn = $('<strong></strong>')
    .css(menuBarCSSProperties)
    .html(Icons.gear || '')
    .attr('title', '设置')
  // Note: Click handler will be set up after determining which settings system to use

  const jumpToNewestBtn = $('<strong></strong>')
    .css(menuBarCSSProperties)
    .html(Icons.newest || '')
    .attr('title', '跳转到最新评论')
    .click(() => {
      $('#comment_list_plain').slideDown()
      hiddenCommentsInfo.text(`点击折叠${plainCommentsCount}条普通评论`)
      // get the target element with the same id as lastRow inside the FeatureElements
      const targetId = lastRow[0]?.id
      const targetItem = isLastRowFeatured
        ? featuredCommentElements.find(item => item.element.id === targetId)
        : plainCommentElements.at(-1)
      if (targetItem) {
        $('html, body').animate({
          scrollTop: $(targetItem.element).offset()!.top,
        })
      }
      $(lastRow).css({
        'background-color': '#ffd966',
        'transition': 'background-color 0.5s ease-in-out',
      })
      setTimeout(() => {
        $(lastRow).css('background-color', '')
      }, 750)
    })

  const menuBar = $(
    '<h3 style="padding:10px;display:flex;width:100%;align-items:center;">所有精选评论</h3>',
  )

  if (BGM_EP_REGEX.test(location.href)) {
    const showPrematureBtn = $('<strong></strong>')
      .css(menuBarCSSProperties)
      .html(Icons.eyeOpen || '')
      .attr('title', '显示开播前发表的评论')
      .click(() => {
        const hideStatus: boolean = $('.premature-comment').is(':visible')
        butterup.toast({
          title: `开播前发表的评论已${hideStatus ? '隐藏' : '显示'}`,
          location: 'top-right',
          dismissable: false,
          type: 'success',
          duration: 2000,
          icon: true,
        })
        // $('.premature-comment').css('border', '1px dashed #E62727')
        $('.premature-comment').slideToggle()
      })
    menuBar.append(showPrematureBtn)
  }
  menuBar.append(settingBtn)
  menuBar.append(jumpToNewestBtn)
  container.append(menuBar)
  const trinity: { [key: string]: () => void } = {
    reactionCount() {
      featuredCommentElements = quickSort(featuredCommentElements, 'score', false)
    },
    replyCount() {
      featuredCommentElements = quickSort(featuredCommentElements, 'replyCount', false)
    },
    oldFirst() {
      featuredCommentElements = quickSort(featuredCommentElements, 'timestampNumber', true)
    },
    newFirst() {
      featuredCommentElements = quickSort(featuredCommentElements, 'timestampNumber', false)
    },
  }
  const sortFn = trinity[sortModeData]
  if (sortFn) {
    sortFn()
  }
  /**
   * Append components
   */
  featuredCommentElements.forEach((element: CommentElement) => {
    container.append($(element.element))
  })
  plainCommentElements.forEach((element: CommentElement) => {
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
  plainCommentElements.forEach((element: CommentElement) => {
    plainCommentsContainer.append($(element.element))
  })

  container.append(plainCommentsContainer)
  // Scroll to conserved row if exists
  if (preservedRow) {
    $('html, body').animate({
      scrollTop: $(preservedRow).offset()!.top,
    })
  }
  $('#sortMethodSelect').val(sortModeData)
  // Auto-expand plain comments if there are few featured comments and plain comments are hidden
  if (featuredCommentsCount < 10 && userSettings.hidePlainComments === true) {
    $('#toggleFilteredBtn').click()
  }
  // Initialize CloudStorage settings if available, otherwise use standalone menu
  const cloudSettingsInitialized = initCloudSettings(userSettings, BGM_EP_REGEX.test(location.href))

  createSettingMenu(userSettings, BGM_EP_REGEX.test(location.href))
  // Set up settings button click handler for standalone mode
  settingBtn.on('click', () => window.BCE!.settingsDialog!.show())

  // control center
  $(document).on('settingsSaved', () => {
    butterup.toast({
      title: '设置已保存',
      location: 'top-right',
      dismissable: false,
      type: 'success',
      duration: 1500,
      icon: true,
      onTimeout: () => {
        location.reload()
      },
    })
  })
})()
