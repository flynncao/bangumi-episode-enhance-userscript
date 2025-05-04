import { BGM_EP_REGEX } from '../constants/index'
import { purifiedDatetimeInMillionSeconds } from '../utils/index'
export default function processComments(userSettings) {
  // check if the target element is valid

  const username = $('.idBadgerNeue .avatar').attr('href')
    ? $('.idBadgerNeue .avatar').attr('href').split('/user/')[1]
    : ''
  const conservedPostID =
    $(location).attr('href').split('#').length > 1 ? $(location).attr('href').split('#')[1] : null
  const allCommentRows = $('.row.row_reply.clearit')
  let plainCommentsCount = 0
  let featuredCommentsCount = 0
  const minimumContentLength = userSettings.minimumFeaturedCommentLength
  const container = $('#comment_list')
  const plainCommentElements = []
  const featuredCommentElements = []
  let conservedRow = null
  allCommentRows.each(function (index, row) {
    const that = $(this)
    const content = $(row)
      .find(BGM_EP_REGEX.test(location.href) ? '.message.clearit' : '.inner .message')
      .text()
    // findi img tag count inside inner .message
    const imgCount = $(row).find('.inner .message img').length
    console.log('imgCount', imgCount)
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
    const hasConservedReply = conservedPostID && that.find(`#${conservedPostID}`).length > 0
    if (hasConservedReply) conservedRow = row
    if (!hasConservedReply) subReplyContent.hide()
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
    if (hasConservedReply || important) {
      isFeatured = true
    }

    if (isFeatured) {
      console.log(`content.trim()`, content.trim().length)
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
  console.log('featuredCommentElements', featuredCommentElements)
  return {
    plainCommentsCount,
    featuredCommentsCount,
    container,
    plainCommentElements,
    featuredCommentElements,
    conservedRow,
  }
}
