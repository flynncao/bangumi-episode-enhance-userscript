// ==UserScript==
// @name         Bangumi Episode Enhance 
// @version      0.0.6
// @description  Enhance Bangumi episode page with more information and features
// @updateURL 
// @downloadURL 
// @author Flynn Cao
// @namespace https://flynncao.xyz/
// @match  https://bangumi.tv/ep/*
// @match  https://chii.in/ep/*
// @match  https://bgm.tv/ep/*
// @include /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/(ep)\/*/
// @license MIT
// ==/UserScript==
(function () {
	console.log('welcome to Bangumi Episode Enhance ')
	const allCommentRows = $('.row.row_reply.clearit')
	let plainCommentsCount = 0
	const minimumContentLength = 15
	const container = $('#comment_list')
	const plainCommentElements = []
	const featuredCommentElements = []
	allCommentRows.each(function (index, row) {
		let that = $(this)
		const content = $(row).find('.message.clearit').text()
		let commentScore = 1
		that.find('span.num').each(function (index, element) {
			commentScore += Number.parseInt($(element).text())
		})
		const subReplyContnet = that.find('.topic_sub_reply')
		subReplyContnet.hide()
		const addReplyBtn = that.find('.action').eq(1)
		const commentsCount = subReplyContnet.find('.sub_reply_bg').length
		if (commentsCount !== 0) {
			const a = $(`<a class="expand_all" href="javascript:void(0)" style="margin:0 3px 0 5px;"><span class="ico ico_reply">展开(+${commentsCount})</span></a>`)
			a.on('click', function () {
				subReplyContnet.toggle()
			})
			const el = $(`<div class="action"></div>`).append(a)
			addReplyBtn.before(el)
		}
		const isShortReply = content.trim().length < minimumContentLength
		if (commentScore === 1 && isShortReply) {
			plainCommentsCount++;
			plainCommentElements.push({
				element: row,
				score: commentScore,
			})
		} else {
			featuredCommentElements.push({
				element: row,
				score: commentScore,
			})
		}
	})
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
	const hiddenCommentsInfo = $(`<div class="filtered" style="cursor:pointer">点击显示/隐藏剩余${plainCommentsCount}条普通评论</div>`).click(function () {
		$('#comment_list_plain').toggle()
	})
	stateBar.append(hiddenCommentsInfo)
	container.find('.row').detach()
	quickSort(featuredCommentElements).forEach(function (element) {
		container.append($(element.element))
	})
	plainCommentElements.forEach(function (element) {
		container.append($(element.element))
	})
	container.append(stateBar)
	const plainCommentsContainer = $('<div id="comment_list_plain" style="margin-top:2rem;"></div>').hide()
	plainCommentElements.forEach(function (element) {
		plainCommentsContainer.append($(element.element))
	})
	container.append(plainCommentsContainer)


})();
