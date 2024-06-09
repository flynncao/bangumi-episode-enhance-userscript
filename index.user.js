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
// @grant GM.getValue
// @grant GM.setValue
// ==/UserScript==
(async function () {
	/**
	 * Greetings
	 */
	console.log('welcome to Bangumi Episode Enhance ')
	/**
	 * Settings
	 */
	const settings = {
		hidePlainComments: true,
		minimumFeaturedCommentLength: 15,
		maxiumFeaturedComments: 99
	}
	async function initStorage() {
		const keys = Object.keys(settings)
		for (let key of keys) {
			const value = await GM.getValue(key)
			if (value === undefined) {
				await GM.setValue(key, settings[key])
			}
		}
	}
	async function setStorageKey(key, value) {
		await GM.setValue(key, value)
	}
	async function getStorageKey(key) {
		return await GM.getValue(key)
	}
	await initStorage()

	const userSettings = {
		hidePlainComments: await getStorageKey('hidePlainComments'),
		minimumFeaturedCommentLength: Number(await getStorageKey('minimumFeaturedCommentLength')),
		maxiumFeaturedComments: Number(await getStorageKey('maxiumFeaturedComments'))
	}
	const setMinimumFeaturedCommentInput = $(`<input type="number" min="1" max="100" step="1" value="${userSettings.minimumFeaturedCommentLength}" style="width: 2rem;margin-left:3px;">`)
	const setMaximumFeaturedCommentsInput = $(`<input type="number" min="1" max="100" step="1" value="${userSettings.maxiumFeaturedComments}" style="width: 2rem;margin-left:3px;" >`)
	const setHidePlainCommentsInput = $(`<input type="checkbox"  style="flex:none;margin-right:3px;" id="epe-hide-plain">`).attr('checked', userSettings.hidePlainComments)
	const settingsContainer = $(`<div style="padding:10px;"></div>`)
	const settingsForm = $('<form style="display:flex; align-items:center; justify-content:flex-start; margin-top:5px;"></form>')
	const settingsLabel = $('<label style="display:inline-block;margin-right:5px;" title="字数不够的评论不会设置为精选，至少为1" >最低有效字数</label>')
	const settingsLabel2 = $('<label style="display:inline-block;margin-right:5px;" title="显示的精选评论数，至少为1，显示\'回复我\'的消息时会无视这个上限" >最大精选评论数</label>')
	const settingsLabel3 = $('<label style="display:inline-flex;align-items:center;margin-right:5px;" title="你可以在最底部点击文字展开普通评论"></label>')
	settingsLabel.append(setMinimumFeaturedCommentInput)
	settingsLabel2.append(setMaximumFeaturedCommentsInput)
	settingsLabel3.append(setHidePlainCommentsInput)
	settingsLabel3.append('折叠普通评论')
	settingsForm.append([settingsLabel, settingsLabel2, settingsLabel3])
	const settingsButton = $('<button>保存</button>')
	settingsButton.click(async function () {
		await setStorageKey('minimumFeaturedCommentLength', setMinimumFeaturedCommentInput.val() > 0 ? setMinimumFeaturedCommentInput.val() : 1)
		await setStorageKey('maxiumFeaturedComments', setMaximumFeaturedCommentsInput.val() > 0 ? setMaximumFeaturedCommentsInput.val() : 1)
		await setStorageKey('hidePlainComments', setHidePlainCommentsInput.is(':checked'))
		alert('设置已保存')
		location.reload()
	})
	settingsForm.append(settingsButton)
	settingsContainer.append($('<div style="margin-right:5px;">※默认按照收到的贴贴数排序：</div>'))
	settingsContainer.append(settingsForm)
	/**
	 * Main
	 */
	const allCommentRows = $('.row.row_reply.clearit')
	const conservedPostID = $(location).attr('href').split('#').length > 1 ? $(location).attr('href').split('#')[1] : null
	let plainCommentsCount = 0
	let featuredCommentsCount = 0
	const minimumContentLength = userSettings.minimumFeaturedCommentLength
	const container = $('#comment_list')
	const plainCommentElements = []
	const featuredCommentElements = []
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
		const subReplyContnet = that.find('.topic_sub_reply')
		if (!hasConservedReply) subReplyContnet.hide()
		const timestampArea = that.find('.action').first()
		const commentsCount = subReplyContnet.find('.sub_reply_bg').length
		if (commentsCount !== 0) {
			const a = $(`<a class="expand_all" href="javascript:void(0)" style="margin:0 3px 0 5px;"><span class="ico ico_reply">展开(+${commentsCount})</span></a>`)
			a.on('click', function () {
				subReplyContnet.toggle()
			})
			const el = $(`<div class="action"></div>`).append(a)
			timestampArea.after(el)
		}
		// check if thie comment meet the requirement of minimumContentLength
		const isShortReply = content.trim().length < minimumContentLength
		let isFeatured = false
		if (commentScore > 1 && !isShortReply) {
			isFeatured = true
		}	
		if (featuredCommentsCount >= userSettings.maxiumFeaturedComments) {
			isFeatured = false
		}
		if (hasConservedReply) {
			isFeatured = true
		}
		if (isFeatured) {
			featuredCommentsCount++
			featuredCommentElements.push({
				element: row,
				score: commentScore,
			})
		} else {
			plainCommentsCount++
			plainCommentElements.push({
				element: row,
				score: commentScore,
			})
		}
		// if(featuredCommentsCount > userSettings.maxiumFeaturedComments || (commentScore === 1 && isShortReply)){
		// 	plainCommentsCount++
		// 	plainCommentElements.push({
		// 		element: row,
		// 		score: commentScore,
		// 	})
		// 	return 
		// }
		// if(((!(commentScore === 1 && isShortReply) && featuredCommentsCount < userSettings.maxiumFeaturedComments)) || hasConservedReply){
		// 	conservedRow = row
		// 	featuredCommentsCount++;
		// 	featuredCommentElements.push({
		// 		element: row,
		// 		score: commentScore,
		// 	})
		// }else{
		// 	plainCommentsCount++
		// 	plainCommentElements.push({
		// 		element: row,
		// 		score: commentScore,
		// 	})
		// }

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
	const hiddenCommentsInfo = $(`<div class="filtered" style="cursor:pointer;color:#48a2c3;">点击展开/折叠剩余${plainCommentsCount}条普通评论</div>`).click(function () {
		$('#comment_list_plain').toggle()
	})
	stateBar.append(hiddenCommentsInfo)
	container.find('.row').detach()
	container.append(settingsContainer)
	quickSort(featuredCommentElements).forEach(function (element) {
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
		$('html, body').animate({
			scrollTop: $(conservedRow).offset().top
		}, 2000);
	}


})();
