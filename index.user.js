// ==UserScript==
// @name        bangumi-comment-enhance
// @version     0.2.2
// @description Improve comment reading experience, hide certain comments, sort featured comments by reaction count or reply count, and more.
// @author      Flynn Cao
// @updateURL   https://github.com/flynncao/bangumi-episode-enhance-userscript/raw/main/index.user.js
// @downloadURL https://github.com/flynncao/bangumi-episode-enhance-userscript/raw/main/index.user.js
// @namespace   https://flynncao.uk/
// @match       https://bangumi.tv/*
// @match       https://chii.in/*
// @match       https://bgm.tv/*
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)*/
// @license     MIT
// ==/UserScript==
'use strict'

const NAMESPACE = 'BangumiCommentEnhance'

class Storage {
  static set(key, value) {
    localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value))
  }

  static get(key) {
    const value = localStorage.getItem(`${NAMESPACE}_${key}`)
    return value ? JSON.parse(value) : undefined
  }

  static async init(settings) {
    const keys = Object.keys(settings)
    for (let key of keys) {
      const value = Storage.get(key)
      if (value === undefined) {
        Storage.set(key, settings[key])
      }
    }
  }
}

/**
 * Build components
 */
function initSettingsContainer(userSettings) {
  const setMinimumFeaturedCommentInput = $(
    `<input type="number" min="0" max="100" step="1" value="${userSettings.minimumFeaturedCommentLength}" style="width: 2rem;margin-left:3px;">`,
  )
  const setMaximumFeaturedCommentsInput = $(
    `<input type="number" min="1" max="100" step="1" value="${userSettings.maxFeaturedComments}" style="width: 2rem;margin-left:3px;" >`,
  )
  const setHidePlainCommentsInput = $(
    `<input type="checkbox"  style="flex:none;margin-right:3px;" id="epe-hide-plain">`,
  ).attr('checked', userSettings.hidePlainComments)
  const setStickyMentionedInput = $(
    `<input type="checkbox"  style="flex:none;margin-right:3px;" id="epe-sticky-mentioned">`,
  ).attr('checked', userSettings.stickyMentioned)
  const settingsContainer = $(`<div style="padding:10px;"></div>`)
  const settingsForm = $(
    '<form style="display:flex; align-items:center; justify-content:flex-start; margin-top:5px;"></form>',
  )
  const settingsLabel = $(
    '<label style="display:inline-block;margin-right:5px;" title="字数不够的评论不会设置为精选，至少为0" >最低有效字数</label>',
  )
  const settingsLabel2 = $(
    '<label style="display:inline-block;margin-right:5px;" title="显示的精选评论数，至少为1，显示\'回复我\'的消息时会无视这个上限" >最大精选评论数</label>',
  )
  const settingsLabel3 = $(
    '<label style="display:inline-flex;align-items:center;margin-right:5px;" title="你可以在最底部点击文字展开普通评论"></label>',
  )
  const settingsLabel4 = $(
    '<label style="display:inline-flex;align-items:center;margin-right:5px;"></label>',
  )
  settingsLabel.append(setMinimumFeaturedCommentInput)
  settingsLabel2.append(setMaximumFeaturedCommentsInput)
  settingsLabel3.append(setHidePlainCommentsInput)
  settingsLabel3.append('折叠普通评论')
  settingsLabel4.append(setStickyMentionedInput)
  settingsLabel4.append('置顶@我')
  settingsForm.append([settingsLabel, settingsLabel2, settingsLabel3, settingsLabel4])
  const settingsButton = $('<button>保存</button>')
  const sortMethodForm = $(
    '<div style="width:100%;"><select id="sortMethodSelect" name="reactionCount"><option value="reactionCount">按热度（贴贴数）排序</option><option value="replyCount">按评论数排序</option><option value="oldFirst">按时间排序(最旧在前)</option><option value="newFirst">按时间排序(最新在前)</option></select></div>',
  )

  settingsButton.click(async function () {
    Storage.set(
      'minimumFeaturedCommentLength',
      setMinimumFeaturedCommentInput.val() >= 0 ? setMinimumFeaturedCommentInput.val() : 0,
    )
    Storage.set(
      'maxFeaturedComments',
      setMaximumFeaturedCommentsInput.val() > 0 ? setMaximumFeaturedCommentsInput.val() : 1,
    )
    Storage.set('hidePlainComments', setHidePlainCommentsInput.is(':checked'))
    Storage.set('stickyMentioned', setStickyMentionedInput.is(':checked'))
    Storage.set('sortMode', $('#sortMethodSelect').val() || 'reactionCount')
    alert('设置已保存')
    location.reload()
  })

  settingsForm.append(settingsButton)
  settingsContainer.append(sortMethodForm)
  settingsContainer.append(settingsForm)

  return settingsContainer
}

function quickSort(arr, sortKey, changeCompareDirection = false) {
  if (arr.length <= 1) {
    return arr
  }
  const pivot = arr[0]
  const left = []
  const right = []
  for (let i = 1; i < arr.length; i++) {
    const compareResult = !changeCompareDirection
      ? arr[i][sortKey] > pivot[sortKey]
      : arr[i][sortKey] < pivot[sortKey]
    if (arr[i][sortKey] && compareResult) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }
  return quickSort(left, sortKey, changeCompareDirection).concat(
    pivot,
    quickSort(right, sortKey, changeCompareDirection),
  )
}

function purifiedDatetimeInMillionSeconds(timestamp) {
  return new Date(timestamp.trim().replace('- ', '')).getTime()
}

const BGM_EP_REGEX = /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/ep\/\d+/
const BGM_GROUP_REGEX =
  /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/group\/topic\/\d+/

function processComments(userSettings) {
  const username = $('.idBadgerNeue .avatar').attr('href').split('/user/')[1]
  const conservedPostID =
    $(location).attr('href').split('#').length > 1 ? $(location).attr('href').split('#')[1] : null
  const allCommentRows = $('.row.row_reply.clearit')
  let plainCommentsCount = 0
  let featuredCommentsCount = 0
  const minimumContentLength = userSettings.minimumFeaturedCommentLength
  const container = $('#comment_list')
  const plainCommentElements = []
  let featuredCommentElements = []
  let conservedRow = null
  allCommentRows.each(function (index, row) {
    let that = $(this)
    const content = $(row)
      .find(BGM_EP_REGEX.test(location.href) ? '.message.clearit' : '.inner')
      .text()
    let commentScore = 1
    let mentionedInSubReply = false
    // prioritize @me comments on
    const highlightMentionedColor = '#ff8c00'
    if (userSettings.stickyMentioned) {
      if (that.find('.avatar').attr('href').includes(username)) {
        that.css('border-color', highlightMentionedColor)
        that.css('border-width', '1px')
        that.css('border-style', 'dashed')
        commentScore += 10000
      }
    }
    that.find(`.topic_sub_reply .sub_reply_bg.clearit`).each(function (index, element) {
      that.find('span.num').each(function (index, element) {
        commentScore += Number.parseInt($(element).text())
      })
      if (userSettings.stickyMentioned && $(element).attr('data-item-user') === username) {
        $(element).css('border-color', highlightMentionedColor)
        $(element).css('border-width', '1px')
        $(element).css('border-style', 'dashed')
        commentScore += 1000
        mentionedInSubReply = true
      }
    })
    that.find('span.num').each(function (index, element) {
      commentScore += Number.parseInt($(element).text())
    })
    const hasConservedReply = conservedPostID && that.find(`#${conservedPostID}`).length > 0
    if (hasConservedReply) conservedRow = row
    const subReplyContent = that.find('.topic_sub_reply')
    if (!hasConservedReply) subReplyContent.hide()
    const timestampArea = that.find('.action').first()
    const commentsCount = subReplyContent.find('.sub_reply_bg').length
    if (commentsCount !== 0) {
      const a = $(
        `<a class="expand_all" href="javascript:void(0)" style="margin:0 3px 0 5px;"><span class="ico ico_reply">展开(+${commentsCount})</span></a>`,
      )
      mentionedInSubReply && a.css('color', highlightMentionedColor)
      a.on('click', function () {
        subReplyContent.slideToggle()
      })
      const el = $(`<div class="action"></div>`).append(a)
      timestampArea.after(el)
    }
    // check if this comment meets the requirement of minimumContentLength
    const isShortReply = content.trim().length < minimumContentLength
    let isFeatured = !(featuredCommentsCount >= userSettings.maxFeaturedComments)
    if (isShortReply || commentScore <= 1) {
      isFeatured = false
    }
    // conserved reply must be fixed
    if (hasConservedReply) {
      isFeatured = true
    }

    const timestamp = isFeatured
      ? $(row)
          .find('.action:eq(0) small')
          .first()
          .contents()
          .filter(function () {
            return this.nodeType === 3 // Node.TEXT_NODE === 3
          })
          .first()
          .text()
      : $(row).find('small').text().trim()
    if (isFeatured) {
      featuredCommentsCount++
      featuredCommentElements.push({
        element: row,
        score: commentScore,
        commentsCount,
        timestampNumber: purifiedDatetimeInMillionSeconds(timestamp),
      })
    } else {
      plainCommentsCount++
      plainCommentElements.push({
        element: row,
        score: commentScore,
        timestamp,
        timestampNumber: purifiedDatetimeInMillionSeconds(timestamp),
      })
    }
  })
  return {
    plainCommentsCount,
    featuredCommentsCount,
    container,
    plainCommentElements,
    featuredCommentElements,
    conservedRow,
  }
}

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
  container.append(initSettingsContainer(userSettings))
  container.append($('<h3 style="padding:0 10px 10px 10px;">所有精选评论</h3>'))
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
