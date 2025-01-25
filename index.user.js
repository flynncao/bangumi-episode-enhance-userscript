// ==UserScript==
// @name  Bangumi Episode Enhance
// @version 0.1.1.4
// @description  Enhance Bangumi episode page with more information and features
// @updateURL  https://github.com/flynncao/bangumi-episode-enhance-userscript/raw/main/index.user.js
// @downloadU RL https://github.com/flynncao/bangumi-episode-enhance-userscript/raw/main/index.user.js
// @author Flynn Cao
// @namespace https://flynncao.xyz/
// @match  https://bangumi.tv/*
// @match  https://chii.in/*
// @match  https://bgm.tv/*
// @include /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)*/
// @license MIT
// ==/UserScript==

;(async function () {
  /**
   * Namespace
   */
  const NAMESPACE = 'BangumiEpisodeEnhance'

  /**
   * Storage Functions
   */
  function setLocalStorageKey(key, value) {
              localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value))
  }

  function getLocalStorageKey(key) {
    const value = localStorage.getItem(`${NAMESPACE}_${key}`)
    return value ? JSON.parse(value) : undefined
  }

  async function initStorage() {
    const keys = Object.keys(settings)
    for (let key of keys) {
      const value = getLocalStorageKey(key)
      if (value === undefined) {
        setLocalStorageKey(key, settings[key])
      }
    }
  }

  /**
   * Prepare data
   */
  const settings = {
    hidePlainComments: true,
    minimumFeaturedCommentLength: 15,
    maxFeaturedComments: 99,
    sortMode: 'reactionCount',
  }

  async function setStorageKey(key, value) {
    setLocalStorageKey(key, value)
  }

  async function getStorageKey(key) {
    return getLocalStorageKey(key)
  }

  await initStorage()

  const sortModeData = await getStorageKey('sortMode')
  const userSettings = {
    hidePlainComments: await getStorageKey('hidePlainComments'),
    minimumFeaturedCommentLength: Number(await getStorageKey('minimumFeaturedCommentLength')),
    maxFeaturedComments: Number(await getStorageKey('maxFeaturedComments')),
    sortMode: sortModeData,
  }

  /**
   * Build components
   */
  const setMinimumFeaturedCommentInput = $(
    `<input type="number" min="0" max="100" step="1" value="${userSettings.minimumFeaturedCommentLength}" style="width: 2rem;margin-left:3px;">`,
  )
  const setMaximumFeaturedCommentsInput = $(
    `<input type="number" min="1" max="100" step="1" value="${userSettings.maxFeaturedComments}" style="width: 2rem;margin-left:3px;" >`,
  )
  const setHidePlainCommentsInput = $(
    `<input type="checkbox"  style="flex:none;margin-right:3px;" id="epe-hide-plain">`,
  ).attr('checked', userSettings.hidePlainComments)
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
  settingsLabel.append(setMinimumFeaturedCommentInput)
  settingsLabel2.append(setMaximumFeaturedCommentsInput)
  settingsLabel3.append(setHidePlainCommentsInput)
  settingsLabel3.append('折叠普通评论')
  settingsForm.append([settingsLabel, settingsLabel2, settingsLabel3])
  const settingsButton = $('<button>保存</button>')
  const sortMethodForm = $(
    '<div style="width:100%;"><select id="sortMethodSelect" name="reactionCount"><option value="reactionCount">按热度（贴贴数）排序</option><option value="oldFirst">按时间排序(最旧在前)</option><option value="newFirst">按时间排序(最新在前)</option></select></div>',
  )

  settingsButton.click(async function () {
    await setStorageKey(
      'minimumFeaturedCommentLength',
      setMinimumFeaturedCommentInput.val() >= 0 ? setMinimumFeaturedCommentInput.val() : 0,
    )
    await setStorageKey(
      'maxFeaturedComments',
      setMaximumFeaturedCommentsInput.val() > 0 ? setMaximumFeaturedCommentsInput.val() : 1,
    )
    await setStorageKey('hidePlainComments', setHidePlainCommentsInput.is(':checked'))
    await setStorageKey('sortMode', $('#sortMethodSelect').val() || 'reactionCount')
    alert('设置已保存')
    location.reload()
  })

  settingsForm.append(settingsButton)
  settingsContainer.append(sortMethodForm)
  settingsContainer.append(settingsForm)

  /**
   * Main
   */
  const allCommentRows = $('.row.row_reply.clearit')
  const conservedPostID =
    $(location).attr('href').split('#').length > 1 ? $(location).attr('href').split('#')[1] : null
  let plainCommentsCount = 0
  let featuredCommentsCount = 0
  const minimumContentLength = userSettings.minimumFeaturedCommentLength
  const container = $('#comment_list')
  const plainCommentElements = []
  let featuredCommentElements = []
  let conservedRow = null
  allCommentRows.each(function (index, row) {
    let that = $(this)
    const content = $(row).find('.message.clearit').text()
    let commentScore = 1
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
      a.on('click', function () {
        subReplyContent.toggle()
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
    if (isFeatured) {
      featuredCommentsCount++
      featuredCommentElements.push({
        element: row,
        score: commentScore,
        timestamp: $(row)
          .find('.action:eq(0) small')
          .first()
          .contents()
          .filter(function () {
            return this.nodeType === 3 // Node.TEXT_NODE === 3
          })
          .first()
          .text(),
      })
    } else {
      plainCommentsCount++
      plainCommentElements.push({
        element: row,
        score: commentScore,
        timestamp: $(row).find('small').text().trim(),
      })
    }
  })

  /**
   * Sort
   */
  const quickSort = function (arr) {
    if (arr.length <= 1) {
      return arr
    }
    const pivot = arr[0]
    const left = []
    const right = []
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].score > pivot.score) {
        left.push(arr[i])
      } else {
        right.push(arr[i])
      }
    }
    return quickSort(left).concat(pivot, quickSort(right))
  }

  let stateBar = container.find('.row_state.clearit')
  if (stateBar.length === 0) {
    stateBar = $(`<div id class="row_state clearit"></div>`)
  }
  const hiddenCommentsInfo = $(
    `<div class="filtered" id="toggleFilteredBtn" style="cursor:pointer;color:#48a2c3;">点击展开/折叠剩余${plainCommentsCount}条普通评论</div>`,
  ).click(function () {
    $('#comment_list_plain').toggle()
  })
  stateBar.append(hiddenCommentsInfo)
  container.find('.row').detach()
  container.append(settingsContainer)

  function purifiedDatetimeInMillionSeconds(timestamp) {
    return new Date(timestamp.trim().replace('- ', '')).getTime()
  }

  const trinity = {
    reactionCount: function () {
      featuredCommentElements = quickSort(featuredCommentElements)
    },
    oldFirst: function () {
      featuredCommentElements.sort(function (a, b) {
        return (
          purifiedDatetimeInMillionSeconds(a.timestamp) -
          purifiedDatetimeInMillionSeconds(b.timestamp)
        )
      })
    },
    newFirst: function () {
      featuredCommentElements.sort(function (a, b) {
        return (
          purifiedDatetimeInMillionSeconds(b.timestamp) -
          purifiedDatetimeInMillionSeconds(a.timestamp)
        )
      })
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

  /**
   * Update layout
   */
  $('#sortMethodSelect').val(sortModeData)
  if (featuredCommentsCount < 10 && userSettings.hidePlainComments === true) {
    $('#toggleFilteredBtn').click()
  }
})()
