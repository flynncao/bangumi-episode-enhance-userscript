import { initSettings } from './components/layouts/settings/index'
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
  })
  const userSettings = {
    hidePlainComments: Storage.get('hidePlainComments'),
    minimumFeaturedCommentLength: Storage.get('minimumFeaturedCommentLength'),
    maxFeaturedComments: Storage.get('maxFeaturedComments'),
    sortMode: Storage.get('sortMode'),
    stickyMentioned: Storage.get('stickyMentioned'),
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
    conservedRow,
  } = processComments(userSettings)
  let stateBar = container.find('.row_state.clearit')
  if (stateBar.length === 0) {
    stateBar = $(`<div id class="row_state clearit"></div>`)
  }
  const hiddenCommentsInfo = $(
    `<div class="filtered" id="toggleFilteredBtn" style="cursor:pointer;color:#48a2c3;">点击展开/折叠剩余${plainCommentsCount}条普通评论</div>`,
  ).click(function () {
    $('#comment_list_plain').slideToggle()
  })
  stateBar.append(hiddenCommentsInfo)
  container.find('.row').detach()
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
  container.append(
    $(
      '<h3 style="padding:10px;display:flex;width:100%;align-items:center;">所有精选评论</h3>',
    ).append(settingBtn),
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
  const plainCommentsContainer = $('<div id="comment_list_plain" style="margin-top:2rem;"></div>')
  if (userSettings.hidePlainComments) {
    plainCommentsContainer.hide()
  }
  plainCommentElements.forEach(function (element) {
    plainCommentsContainer.append($(element.element))
  })

  container.append(plainCommentsContainer)
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
  initSettings(userSettings)
  // control center
  $(document).on('settingsSaved', (event, data) => {
    location.reload()
  })
})()
