import { purifiedDatetimeInMillionSeconds } from '../utils/index'
import { BGM_EP_REGEX } from '../constants/index'
export default function processComments(userSettings) {
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
