import { BGM_EP_REGEX } from '../constants/index'
import { purifiedDatetimeInMillionSeconds } from '../utils/index'
export default function processComments(userSettings) {
  // check if the target element is valid
  const username = $('.idBadgerNeue .avatar').attr('href')
    ? $('.idBadgerNeue .avatar').attr('href').split('/user/')[1]
    : ''
  const preservedPostID =
    $(location).attr('href').split('#').length > 1 ? $(location).attr('href').split('#')[1] : null
  const allCommentRows = $('.row.row_reply.clearit')
  let plainCommentsCount = 0
  let featuredCommentsCount = 0
  let prematureCommentsCount = 0
  const minimumContentLength = userSettings.minimumFeaturedCommentLength
  const container = $('#comment_list')
  const plainCommentElements = []
  const featuredCommentElements = []
  const lastRow = allCommentRows.last()
  let preservedRow = null

  // Get first broadcast time for episode pages
  let firstBroadcastDate = null
  if (BGM_EP_REGEX.test(location.href) && userSettings.hidePremature) {
    try {
      const broadcastTimeMatch = document
        .querySelectorAll('.tip')[0]
        .innerHTML.match(/\d{4}-\d{1,2}-\d{1,2}/)
      if (broadcastTimeMatch && broadcastTimeMatch[0]) {
        const dateParts = broadcastTimeMatch[0].split('-')
        firstBroadcastDate = new Date(
          Number.parseInt(dateParts[0]),
          Number.parseInt(dateParts[1]) - 1, // Month is 0-indexed in JS
          Number.parseInt(dateParts[2]),
        )
        firstBroadcastDate.setHours(0, 0, 0, 0) // Set to beginning of the day
      }
    } catch (error) {
      console.error('Error parsing broadcast date:', error)
    }
  }

  allCommentRows.each(function (index, row) {
    const that = $(this)
    const content = $(row)
      .find(BGM_EP_REGEX.test(location.href) ? '.message.clearit' : '.inner')
      .text()

    // Check if comment is before broadcast date
    let isBeforeBroadcast = false
    if (firstBroadcastDate && BGM_EP_REGEX.test(location.href) && userSettings.hidePremature) {
      try {
        const postTimeMatch = that
          .find('.re_info')
          .text()
          .match(/\d{4}-\d{1,2}-\d{1,2}/)
        if (postTimeMatch && postTimeMatch[0]) {
          const postDateParts = postTimeMatch[0].split('-')
          const postDate = new Date(
            Number.parseInt(postDateParts[0]),
            Number.parseInt(postDateParts[1]) - 1,
            Number.parseInt(postDateParts[2]),
          )
          postDate.setHours(0, 0, 0, 0)

          if (postDate < firstBroadcastDate) {
            isBeforeBroadcast = true
            prematureCommentsCount++
          }
        }
      } catch (error) {
        console.error('Error parsing post date:', error)
      }
    }

    let commentScore = 0
    // prioritize @me comments on
    const highlightMentionedColor = '#ff8c00'
    const subReplyContent = that.find('.topic_sub_reply')
    const commentsCount = subReplyContent.find('.sub_reply_bg').length
    const mentionedInMainComment =
      userSettings.stickyMentioned &&
      that.find('.avatar').attr('href').split('/user/')[1] === username
    let mentionedInSubReply = false
    if (mentionedInMainComment) {
      that.css('border-color', highlightMentionedColor)
      that.css('border-width', '1px')
      that.css('border-style', 'dashed')
      commentScore += 10000
    }
    that.find(`.topic_sub_reply .sub_reply_bg.clearit`).each(function (index, element) {
      if (userSettings.stickyMentioned && $(element).attr('data-item-user') === username) {
        $(element).css('border-color', highlightMentionedColor)
        $(element).css('border-width', '1px')
        $(element).css('border-style', 'dashed')
        commentScore += 1000
        mentionedInSubReply = true
      }
    })
    const important = mentionedInMainComment || mentionedInSubReply
    that.find('span.num').each(function (index, element) {
      commentScore += Number.parseInt($(element).text())
    })
    const hasPreservedReply = preservedPostID && that.find(`#${preservedPostID}`).length > 0
    if (hasPreservedReply) preservedRow = row
    if (!hasPreservedReply) subReplyContent.hide()
    const timestampArea = that.find('.action').first()
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
    let isFeatured =
      userSettings.sortMode === 'reactionCount' ? commentScore >= 1 : commentsCount >= 1
    if (isShortReply || featuredCommentsCount >= userSettings.maxFeaturedComments) {
      isFeatured = false
    }
    // conserved reply must be fixed
    if (hasPreservedReply || important) {
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

    // Skip premature comments if hidePremature is enabled
    if (isBeforeBroadcast && userSettings.hidePremature) {
      // Still count the comment but don't add it to either array
      return
    }

    if (isFeatured) {
      featuredCommentsCount++
      featuredCommentElements.push({
        element: row,
        score: commentScore,
        commentsCount,
        timestampNumber: purifiedDatetimeInMillionSeconds(timestamp),
        important,
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
    prematureCommentsCount,
    container,
    plainCommentElements,
    featuredCommentElements,
    preservedRow,
    lastRow,
  }
}
