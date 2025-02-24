import Storage from './storage/index'
import initSettingsContainer from './components/layouts/menu/index'
import { quickSort, purifiedDatetimeInMillionSeconds } from './utils/index'
import processComments from './modules/comments'
import { BGM_EP_REGEX, BGM_GROUP_REGEX } from './constants/index'
;(async function () {
  if (!BGM_EP_REGEX.test(location.href) && !BGM_GROUP_REGEX.test(location.href)) {
    return
  }
  Storage.init({
    hidePlainComments: true,
    minimumFeaturedCommentLength: 15,
    maxFeaturedComments: 99,
    sortMode: 'reactionCount',
  })
  const userSettings = {
    hidePlainComments: Storage.get('hidePlainComments'),
    minimumFeaturedCommentLength: Storage.get('minimumFeaturedCommentLength'),
    maxFeaturedComments: Storage.get('maxFeaturedComments'),
    sortMode: Storage.get('sortMode'),
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

  console.log('plainCommentElements', plainCommentElements)

  console.log('plainCommentElements', plainCommentElements)
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
  container.append(initSettingsContainer(userSettings))
  const trinity = {
    reactionCount: function () {
      featuredCommentElements = quickSort(featuredCommentElements, 'score')
    },
    replyCount: function () {
      featuredCommentElements = quickSort(featuredCommentElements, 'commentsCount')
    },
    oldFirst: function () {
      featuredCommentElements = quickSort(featuredCommentElements, 'timestampNumber', true)
    },
    newFirst: function () {
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
})()
