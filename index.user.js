// ==UserScript==
// @name        bangumi-comment-enhance
// @version     0.2.4.1
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

// https://www.iconfont.cn/collections/detail?spm=a313x.user_detail.i1.dc64b3430.57e63a81itWm4A&cid=12086
const Icons = {
  answerSheet:
    '<svg t="1741855047626" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2040" width="256" height="256"><path d="M188.8 135.7c-29.7 0-53.8 24.1-53.8 53.7v644.7c0 29.7 24.1 53.7 53.8 53.7h645.4c29.7 0 53.8-24.1 53.8-53.7V189.4c0-29.7-24.1-53.7-53.8-53.7H188.8z m-13-71.1h671.5c61.8 0 111.9 50.1 111.9 111.8v670.8c0 61.7-50.1 111.8-111.9 111.8H175.8C114 959 63.9 909 63.9 847.2V176.4c0-61.8 50.1-111.8 111.9-111.8z m0 0" fill="#333333" p-id="2041"></path><path d="M328 328h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM556 332h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM784 332h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36z" fill="#333333" p-id="2042"></path><path d="M328 546h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM556 550h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM784 550h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36z" fill="#333333" p-id="2043"></path><path d="M328 764h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM556 768h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36zM784 768h-88c-19.8 0-36-16.2-36-36s16.2-36 36-36h88c19.8 0 36 16.2 36 36s-16.2 36-36 36z" fill="#333333" p-id="2044"></path></svg>',
  sorting:
    '<svg t="1741855109866" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2338" width="256" height="256"><path d="M375 898c-19.8 0-36-16.2-36-36V162c0-19.8 16.2-36 36-36s36 16.2 36 36v700c0 19.8-16.2 36-36 36z" fill="#333333" p-id="2339"></path><path d="M398.2 889.6c-15.2 12.7-38 10.7-50.7-4.4L136.6 633.9c-12.7-15.2-10.7-38 4.4-50.7 15.2-12.7 38-10.7 50.7 4.4l210.8 251.3c12.8 15.2 10.8 38-4.3 50.7zM649 126c19.8 0 36 16.2 36 36v700c0 19.8-16.2 36-36 36s-36-16.2-36-36V162c0-19.8 16.2-36 36-36z" fill="#333333" p-id="2340"></path><path d="M625.8 134.4c15.2-12.7 38-10.7 50.7 4.4l210.8 251.3c12.7 15.2 10.7 38-4.4 50.7-15.2 12.7-38 10.7-50.7-4.4L621.4 185.1c-12.7-15.2-10.7-38 4.4-50.7z" fill="#333333" p-id="2341"></path></svg>',
  font: '<svg t="1741855156691" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2635" width="256" height="256"><path d="M859 201H165c-19.8 0-36-16.2-36-36s16.2-36 36-36h694c19.8 0 36 16.2 36 36s-16.2 36-36 36z" fill="#585757" p-id="2636"></path><path d="M476 859V165c0-19.8 16.2-36 36-36s36 16.2 36 36v694c0 19.8-16.2 36-36 36s-36-16.2-36-36z" fill="#585757" p-id="2637"></path></svg>',
  gear: '<svg t="1741861365461" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2783" data-darkreader-inline-fill="" width="256" height="256"><path d="M594.9 64.8c36.8-0.4 66.9 29.1 67.3 65.9v7.8c0 38.2 31.5 69.4 70.2 69.4 12.3 0 24.5-3.3 35-9.3l7.1-4.1c10.3-5.9 22.1-9 33.9-9 23.9 0 46.2 12.5 58.3 32.8L949.9 359c18.7 31.6 7.6 71.9-24.6 90.1l-6.9 3.9c-34 19.2-45.7 61.2-26.4 93.8 6.1 10.3 14.9 18.9 25.4 24.8l7 3.9c32.3 18 43.6 58.5 24.8 90.2L866 806.3c-9.1 15.2-23.8 26.2-41 30.6-17.1 4.4-35.3 2.2-50.7-6.4l-7-3.9c-21.9-12.2-48.5-12.4-70.6-0.4-10.7 5.9-19.7 14.5-25.9 25-6.1 10.4-9.4 22.1-9.3 33.8v7.8c0.1 17.8-7.2 34.7-20 47.1-12.6 12.2-29.6 19-47.2 19H428c-36.6 0.3-66.7-29-67.2-65.5l-0.1-7.8c-0.1-18.4-7.6-36-20.8-48.8-22.5-22-56.9-26.5-84.3-10.9l-7 4.1c-10.3 5.8-22 8.9-33.8 8.9-23.9 0-46.1-12.4-58.2-32.8L73.2 665.2c-8.9-15.1-11.3-33.2-6.7-50.1 4.6-16.9 15.8-31.3 31.2-39.8l6.8-3.9c16.2-9 28.2-24.2 33.1-42.1 4.9-17.4 2.4-36.1-6.9-51.6-6.2-10.4-15.1-19-25.7-24.9l-6.9-3.9c-15.5-8.4-27-22.8-31.7-39.8-4.7-17-2.3-35.2 6.7-50.4L156.3 218c9-15.1 23.8-26.2 41-30.6 17.1-4.4 35.3-2.1 50.7 6.5l7.1 3.9c21.9 12.3 48.6 12.5 70.7 0.5 10.8-5.9 19.8-14.6 26-25.1 6.1-10.4 9.3-22.2 9.2-34.1v-7.9c-0.2-17.8 7-34.8 19.8-47.2 12.6-12.3 29.7-19.1 47.5-19.1h166.6z m-163.2 71c-3.1 0-6.1 1.2-8.4 3.3-1.9 1.8-2.9 4.2-2.9 6.8l0.1 7.6c0.2 21.2-5.4 42-16.3 60.3a120.02 120.02 0 0 1-45.2 43.7c-37.4 20.4-82.6 20.2-119.7-0.7l-6.8-3.8c-2.8-1.6-6.1-2-9.2-1.2-2.8 0.7-5.3 2.5-6.8 5l-80 135.1c-2.7 4.5-1.1 10.2 4.1 13l6.7 3.7c18.6 10.3 34 25.3 44.7 43.4 16.3 27.6 20.6 59.9 12.1 90.8-8.5 30.8-29 56.9-56.9 72.5l-6.6 3.7c-5 2.9-6.6 8.5-3.9 12.9l80 135.1c1.9 3.2 5.7 5.3 10 5.3 2.1 0 4.3-0.5 6.1-1.6l6.8-3.8c18.1-10.3 38.8-15.8 59.9-15.8 31.8 0 62 12.3 84.7 34.4 23 22.5 35.9 52.6 36 84.7v7.5c0 5.2 4.9 9.9 11.3 9.9h160c3.2 0 6.2-1.2 8.3-3.3 1.8-1.7 2.9-4.2 2.9-6.7v-7.5c-0.1-20.9 5.6-41.6 16.4-59.8 10.8-18.3 26.4-33.4 45.1-43.7 37.3-20.4 82.4-20.2 119.5 0.6l6.7 3.8c2.8 1.5 6.1 1.9 9.2 1.1 2.8-0.7 5.3-2.5 6.8-5l80-135c2.7-4.5 1.1-10.2-4-13l-6.7-3.7c-18.4-10.2-33.7-25.2-44.4-43.3-33.8-57.1-13.4-130.5 45-163.5l6.6-3.7c5.1-2.9 6.6-8.5 3.9-13l-79.9-135.1c-2.2-3.4-6-5.4-10-5.3-2.1 0-4.3 0.5-6.1 1.6l-6.8 3.8c-18.3 10.5-39.1 16-60.2 16-66.5 0.2-120.6-53.5-120.8-119.9v-7.5c0-5.3-4.8-10-11.3-10l-160 0.3z m-3.4-15.5" p-id="2784"></path><path d="M512 584c39.8 0 72-32.2 72-72s-32.2-72-72-72-72 32.2-72 72 32.2 72 72 72z m0 72c-79.5 0-144-64.5-144-144s64.5-144 144-144 144 64.5 144 144-64.5 144-144 144z m0 0" p-id="2785"></path></svg>',
}

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
    for (const key of keys) {
      const value = Storage.get(key)
      if (value === undefined) {
        Storage.set(key, settings[key])
      }
    }
  }
}

function initSettings(userSettings) {
  // Create and inject styles
  const injectStyles = () => {
    const styleEl = document.createElement('style')
    styleEl.textContent = `
			.fixed-container {
				position: fixed;
				z-index: 100;
				width: calc(100vw - 50px);
				max-width: 380px;
				background-color: rgba(255, 255, 255, 0.8);
				backdrop-filter: blur(8px);
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				border-radius: 12px;
				box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
				padding: 30px;
				text-align: center;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
				box-sizing: border-box;
				display: none;
			}
			[data-theme="dark"] .fixed-container {
				background-color: rgba(30, 30, 30, 0.8);
				color: #fff;
			}
			.container-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 16px;
			}
			.dropdown-select {
				padding: 8px;
				padding-right:16px;
				border-radius: 6px;
				border: 1px solid #e2e2e2;
				background-color: #f5f5f5;
				font-size: 14px;
				width: 100%;
			}
			[data-theme="dark"] .dropdown-select {
				background-color: #333;
				border-color: #555;
				color: #fff;
			}
			.checkbox-container {
				display: flex;
				align-items: center;
				margin-bottom: 16x;
				text-align: left;
				font-size:14px;
			}
			.input-group {
				display: flex;
				align-items: center;
				margin-bottom: 16px;
				justify-content:flex-start;
			}
			.input-group label {
				text-align: left;
				font-size: 14px;
				margin-right:8px;
			}
			.input-group input {
				max-width: 40px;
				padding: 6px;
				border-radius: 6px;
				border: 1px solid #e2e2e2;
				text-align: center;
			}
			[data-theme="dark"] .input-group input {
				background-color: #333;
				border-color: #555;
				color: #fff;
			}
			.button-group {
				display: flex;
				justify-content: space-between;
				gap: 12px;
			}
			.button-group button {
				flex: 1;
				padding: 10px;
				border-radius: 6px;
				border: none;
				font-size: 16px;
				cursor: pointer;
			}
			.cancel-btn {
				background-color: white;
				border: 1px solid #e2e2e2;
			}
			[data-theme="dark"] .cancel-btn {
				background-color: #333;
				border-color: #555;
				color: #fff;
			}
			.save-btn {
				background-color: #333;
				color: white;
			}
			[data-theme="dark"] .save-btn {
				background-color: #555;
			}
			button:hover{
				filter: brightness(1.5);
				transition: all 0.3s;
			}
			
			strong svg{
				max-width:21px;
				max-height:21px;
				transform: translateY(2px);
				margin-right: 10px;
			}
			[data-theme="dark"] strong svg{
				filter: invert(1);
			}
			input[type="checkbox"]{
				width:20px;
				height:20px;
				margin:0;
				cursor:pointer;
			}
			.checkbox-container input[type="checkbox"] {
				margin-right: 12px;
				transform: translateY(1.5px);
			}
		`
    document.head.append(styleEl)
  }
  // Create DOM elements and construct the UI
  const createSettingsDialog = () => {
    // Create container
    const container = document.createElement('div')
    container.className = 'fixed-container'

    // Create header with dropdown
    const header = document.createElement('div')
    header.className = 'container-header'

    const spacerLeft = document.createElement('div')
    spacerLeft.style.width = '24px'

    const dropdown = document.createElement('select')
    dropdown.className = 'dropdown-select'

    const optionHot = document.createElement('option')
    optionHot.value = 'reactionCount'
    optionHot.textContent = '按热度(贴贴数)排序'

    const optionReply = document.createElement('option')
    optionReply.value = 'replyCount'
    optionReply.textContent = '按评论数排序'

    const optionRecent = document.createElement('option')
    optionRecent.value = 'newFirst'
    optionRecent.textContent = '按时间排序(最新在前)'

    const optionOld = document.createElement('option')
    optionOld.value = 'oldFirst'
    optionOld.textContent = '按时间排序(最旧在前)'

    dropdown.append(optionHot)
    dropdown.append(optionRecent)
    dropdown.append(optionOld)
    dropdown.append(optionReply)
    dropdown.value = userSettings.sortMode || 'reactionCount'

    const spacerRight = document.createElement('div')
    spacerRight.style.width = '24px'

    header.append($('<strong></strong>').html(Icons.sorting)[0])
    header.append(dropdown)
    header.append(spacerRight)

    // Create checkbox
    const checkboxContainer = document.createElement('div')
    checkboxContainer.className = 'checkbox-container'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.id = 'showMine'
    checkbox.checked = userSettings.stickyMentioned || false

    const checkboxLabel = document.createElement('label')
    checkboxLabel.htmlFor = 'showMine'
    checkboxLabel.textContent = '置顶我发表/回复我的帖子'

    checkboxContainer.append(checkbox)
    checkboxContainer.append(checkboxLabel)

    // Create min effective number input
    const minEffGroup = document.createElement('div')
    minEffGroup.className = 'input-group'

    const minEffLabel = document.createElement('label')
    minEffLabel.htmlFor = 'minEffectiveNumber'
    minEffLabel.textContent = '最低有效字数 (>=0)'

    const minEffInput = document.createElement('input')
    minEffInput.type = 'number'
    minEffInput.id = 'minEffectiveNumber'
    minEffInput.value = userSettings.minimumFeaturedCommentLength || 0

    minEffGroup.append($('<strong></strong>').html(Icons.font)[0])
    minEffGroup.append(minEffLabel)
    minEffGroup.append(minEffInput)

    // Create max selected posts input
    const maxPostsGroup = document.createElement('div')
    maxPostsGroup.className = 'input-group'

    const maxPostsLabel = document.createElement('label')
    maxPostsLabel.htmlFor = 'maxSelectedPosts'
    maxPostsLabel.textContent = '最大精选评论数 (>0)'

    const maxPostsInput = document.createElement('input')
    maxPostsInput.type = 'number'
    maxPostsInput.id = 'maxSelectedPosts'
    maxPostsInput.value = userSettings.maxFeaturedComments || 1

    maxPostsGroup.append($('<strong></strong>').html(Icons.answerSheet)[0])
    maxPostsGroup.append(maxPostsLabel)
    maxPostsGroup.append(maxPostsInput)

    const spaceHr = document.createElement('hr')
    spaceHr.style.marginBottom = '16px'
    spaceHr.style.border = 'none'

    // Create buttons
    const buttonGroup = document.createElement('div')
    buttonGroup.className = 'button-group'

    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'cancel-btn'
    cancelBtn.textContent = '取消'

    const saveBtn = document.createElement('button')
    saveBtn.className = 'save-btn'
    saveBtn.textContent = '保存'

    buttonGroup.append(cancelBtn)
    buttonGroup.append(saveBtn)

    // Assemble everything
    container.append(header)
    container.append(minEffGroup)
    container.append(maxPostsGroup)
    container.append(checkboxContainer)
    container.append(spaceHr)
    container.append(buttonGroup)

    // Add to document
    document.body.append(container)

    return {
      container,
      dropdown,
      checkbox,
      minEffInput,
      maxPostsInput,
      cancelBtn,
      saveBtn,
    }
  }
  // Initialize settings from localStorage
  const initSettings = (elements) => {
    const { dropdown, checkbox, minEffInput, maxPostsInput } = elements

    if (localStorage.getItem('sortBy')) {
      dropdown.value = localStorage.getItem('sortBy')
    }

    if (localStorage.getItem('showMine') !== null) {
      checkbox.checked = localStorage.getItem('showMine') === 'true'
    }

    if (localStorage.getItem('minEffectiveNumber')) {
      minEffInput.value = localStorage.getItem('minEffectiveNumber')
    }

    if (localStorage.getItem('maxSelectedPosts')) {
      maxPostsInput.value = localStorage.getItem('maxSelectedPosts')
    }
  }

  // Save settings
  const saveSettings = (elements) => {
    const { container, dropdown, checkbox, minEffInput, maxPostsInput } = elements

    Storage.set(
      'minimumFeaturedCommentLength',
      Math.max(Number.parseInt(minEffInput.value) || 0, 0),
    )
    Storage.set(
      'maxFeaturedComments',
      Number.parseInt(maxPostsInput.value) > 0 ? Number.parseInt(maxPostsInput.value) : 1,
    )
    // Storage.set('hidePlainComments', setHidePlainCommentsInput.is(':checked'))
    Storage.set('stickyMentioned', checkbox.checked)
    Storage.set('sortMode', dropdown.value)

    // Trigger custom event
    const event = new CustomEvent('settingsSaved', {
      detail: {
        sortBy: dropdown.value,
        showMine: checkbox.checked,
        minEffectiveNumber: Number.parseInt(minEffInput.value),
        maxSelectedPosts: Number.parseInt(maxPostsInput.value),
      },
    })
    document.dispatchEvent(event)

    // jQuery compatibility
    if (window.jQuery) {
      jQuery(document).trigger('settingsSaved', {
        sortBy: dropdown.value,
        showMine: checkbox.checked,
        minEffectiveNumber: Number.parseInt(minEffInput.value),
        maxSelectedPosts: Number.parseInt(maxPostsInput.value),
      })
    }

    hideDialog(container)
  }

  // Show dialog
  const showDialog = (container) => {
    container.style.display = 'block'
  }

  // Hide dialog
  const hideDialog = (container) => {
    container.style.display = 'none'
  }

  // Main initialization function
  const init = () => {
    // Inject CSS
    injectStyles()

    // Create the dialog
    const elements = createSettingsDialog()

    // Initialize settings
    initSettings(elements)

    // Setup event listeners
    elements.saveBtn.addEventListener('click', () => saveSettings(elements))
    elements.cancelBtn.addEventListener('click', () => hideDialog(elements.container))

    // Expose API
    window.settingsDialog = {
      show: () => showDialog(elements.container),
      hide: () => hideDialog(elements.container),
      save: () => saveSettings(elements),
      getElements: () => elements,
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}

const BGM_EP_REGEX = /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/ep\/\d+/
const BGM_GROUP_REGEX =
  /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/group\/topic\/\d+/

// quickSort is not strictly needed cause JavaScript has built-in sort method based on quicksort/selection algorithm
function quickSort(arr, sortKey, changeCompareDirection = false) {
  if (arr.length <= 1) {
    return arr
  }
  const pivot = arr[0]
  const left = []
  const right = []
  for (let i = 1; i < arr.length; i++) {
    const element = arr[i]
    const elementImportant = element.important || false
    const pivotImportant = pivot.important || false
    let compareResult

    if (elementImportant !== pivotImportant) {
      compareResult = elementImportant // true if element is important and pivot is not
    } else if (changeCompareDirection) {
      compareResult = element[sortKey] < pivot[sortKey]
    } else {
      compareResult = element[sortKey] > pivot[sortKey]
    }

    if (compareResult) {
      left.push(element)
    } else {
      right.push(element)
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

function processComments(userSettings) {
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
    $(row).find('.inner .message img').length
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
  return {
    plainCommentsCount,
    featuredCommentsCount,
    container,
    plainCommentElements,
    featuredCommentElements,
    conservedRow,
  }
}

/**
 * Check if the prebroadcast script is active
 */
const isPrebroadcastScriptActive = () => {
  return $('#comments_seperater').length > 0
}

/**
 * Wait for the other script to finish processing
 */
const waitForPrebroadcastScript = async () => {
  // If the script isn't active, return immediately
  if (!isPrebroadcastScriptActive()) {
    return false
  }

  // Create a promise that resolves when the other script is done
  return new Promise((resolve) => {
    const pollInterval = 50 // ms
    const maxWaitTime = 5000 // ms
    let elapsedTime = 0

    const checkCompletion = () => {
      // Check if the toggle function exists and has completed
      const toggleExists = typeof window.toggleComments === 'function'
      const isComplete = toggleExists && window.toggleCommentsComplete === true

      // Check if the DOM has been modified by the other script
      const domModified =
        $('#comments_seperater').length > 0 &&
        $('.row.row_reply.clearit').filter(function () {
          return $(this).css('display') === 'none'
        }).length > 0

      if (isComplete || domModified || elapsedTime >= maxWaitTime) {
        resolve(domModified || isComplete)
        return
      }

      elapsedTime += pollInterval
      setTimeout(checkCompletion, pollInterval)
    }

    checkCompletion()
  })
}

/**
 * Handle click events for the prebroadcast toggle
 * This ensures our script works correctly with the other script's dynamic DOM changes
 */
const setupPrebroadcastToggleHandler = () => {
  // Create a flag to track if we're currently handling a click
  let isHandlingClick = false

  // Set up a delegated event handler for all comments_seperater elements
  $(document).on('click', '#comments_seperater', function (event) {
    // Prevent handling multiple clicks at once
    if (isHandlingClick) return
    isHandlingClick = true

    // Store the current button text to determine the toggle state
    const currentText = $(this).text()

    // After the click, there might be a new separator added
    setTimeout(() => {
      // Find all separators
      const allSeparators = $('[id="comments_seperater"]')

      // Keep only the one in our header, remove all others
      const headerSeparator = $('h3:contains("所有精选评论") #comments_seperater')

      if (headerSeparator.length > 0) {
        // Update the header separator text
        headerSeparator.text(
          currentText.includes('展开')
            ? currentText.replace('展开', '折叠')
            : currentText.replace('折叠', '展开'),
        )

        // Remove all other separators
        allSeparators.each(function () {
          if (!$(this).closest('h3').length) {
            $(this).closest('.row_state').remove()
          }
        })
      } else {
        // If we don't have a header separator yet, move one there
        const firstSeparator = allSeparators.first()
        if (firstSeparator.length > 0) {
          // Clone the separator with its event handlers
          const clonedSeparator = firstSeparator.clone(true)

          // Style it to fit in the header
          clonedSeparator.css({
            'margin-left': '10px',
            display: 'inline-block',
          })

          // Add it to the header
          $('h3:contains("所有精选评论")').append(clonedSeparator)

          // Remove the original
          firstSeparator.closest('.row_state').remove()
        }
      }

      // Reset the flag
      isHandlingClick = false
    }, 200) // Slightly longer delay to ensure the DOM has been updated
  })

  // Also set up a MutationObserver to catch any new separators added by the script
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any new separators were added
        const newSeparators = $('#comments_seperater').filter(function () {
          return !$(this).closest('h3').length
        })

        if (newSeparators.length > 0) {
          // Get the header separator
          const headerSeparator = $('h3:contains("所有精选评论") #comments_seperater')

          if (headerSeparator.length > 0) {
            // Update the header separator text
            headerSeparator.text(newSeparators.first().text())

            // Remove the new separators
            newSeparators.each(function () {
              $(this).closest('.row_state').remove()
            })
          } else {
            // If we don't have a header separator yet, move one there
            const firstSeparator = newSeparators.first()

            // Clone the separator with its event handlers
            const clonedSeparator = firstSeparator.clone(true)

            // Style it to fit in the header
            clonedSeparator.css({
              'margin-left': '10px',
              display: 'inline-block',
            })

            // Add it to the header
            $('h3:contains("所有精选评论")').append(clonedSeparator)

            // Remove the original
            firstSeparator.closest('.row_state').remove()
          }
        }
      }
    })
  })

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Store the observer on the window object so it doesn't get garbage collected
  window.commentsMutationObserver = observer
}

/**
 * Render comments based on processed data
 */
const renderComments = (commentData, userSettings, otherScriptActive) => {
  const { featuredCommentsCount, conservedRow } = commentData

  const sortModeData = userSettings.sortMode || 'reactionCount'

  if (otherScriptActive) {
    renderWithOtherScript(commentData, userSettings, sortModeData)
  } else {
    renderStandalone(commentData, userSettings, sortModeData)
  }

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
}

/**
 * Render comments when another script is active
 */
const renderWithOtherScript = (commentData, userSettings, sortModeData) => {
  const { plainCommentsCount, container, plainCommentElements, featuredCommentElements } =
    commentData

  // Find the toggle element added by the other script
  const otherScriptToggle = $('#comments_seperater').closest('.row_state')

  // Create our state bar
  let stateBar = container.find('.row_state.clearit').not(otherScriptToggle)
  if (stateBar.length === 0) {
    stateBar = $(`<div class="row_state clearit"></div>`)
  }

  // Add our toggle for plain comments
  const hiddenCommentsInfo = $(
    `<div class="filtered" id="toggleFilteredBtn" style="cursor:pointer;color:#48a2c3;">点击展开/折叠剩余${plainCommentsCount}条普通评论</div>`,
  ).click(function () {
    $('#comment_list_plain').slideToggle()
  })
  stateBar.append(hiddenCommentsInfo)

  // Clean up container but preserve the other script's elements
  container.find('.row').each(function () {
    if (!$(this).hasClass('row_reply') && !$(this).hasClass('row_state')) {
      $(this).detach()
    }
  })

  // Add settings button and header
  const header = addHeaderWithSettings(container)

  // Move the prebroadcast toggle to the top
  movePrebroadcastToggleToTop(header, otherScriptToggle)

  // Sort and append featured comments
  sortAndAppendFeaturedComments(featuredCommentElements, container, sortModeData, true)

  // Add our state bar after the featured comments but before the other script's toggle
  // We don't need to add the otherScriptToggle here anymore since we moved it to the top
  container.append(stateBar)

  // Create and add plain comments container
  addPlainCommentsContainer(plainCommentElements, stateBar, userSettings.hidePlainComments, true)
}

/**
 * Render comments in standalone mode (no other script)
 */
const renderStandalone = (commentData, userSettings, sortModeData) => {
  const { plainCommentsCount, container, plainCommentElements, featuredCommentElements } =
    commentData

  // Create state bar
  let stateBar = container.find('.row_state.clearit')
  if (stateBar.length === 0) {
    stateBar = $(`<div class="row_state clearit"></div>`)
  }

  // Add toggle for plain comments
  const hiddenCommentsInfo = $(
    `<div class="filtered" id="toggleFilteredBtn" style="cursor:pointer;color:#48a2c3;">点击展开/折叠剩余${plainCommentsCount}条普通评论</div>`,
  ).click(function () {
    $('#comment_list_plain').slideToggle()
  })
  stateBar.append(hiddenCommentsInfo)

  // Clean up container
  container.find('.row').each(function () {
    if (!$(this).hasClass('row_reply')) {
      $(this).detach()
    }
  })

  // Add settings button and header
  addHeaderWithSettings(container)

  // Sort and append featured comments
  sortAndAppendFeaturedComments(featuredCommentElements, container, sortModeData, false)

  // Add plain comments container
  container.append(stateBar)
  addPlainCommentsContainer(plainCommentElements, container, userSettings.hidePlainComments, false)
}

/**
 * Add header with settings button
 */
const addHeaderWithSettings = (container) => {
  // Add settings button
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

  // Create header with flex display to accommodate multiple elements
  const header = $('<h3 style="padding:10px;display:flex;width:100%;align-items:center;"></h3>')

  // Add the title text
  const titleText = $('<span>所有精选评论</span>')

  // Add elements to header
  header.append(titleText)
  header.append(settingBtn)

  // Add header to container
  container.append(header)

  // Return the header element so we can add more elements to it if needed
  return header
}

/**
 * Sort and append featured comments
 */
const sortAndAppendFeaturedComments = (
  featuredCommentElements,
  container,
  sortModeData,
  checkHidden,
) => {
  // Sort featured comments
  const trinity = {
    reactionCount() {
      return quickSort(featuredCommentElements, 'score')
    },
    replyCount() {
      return quickSort(featuredCommentElements, 'commentsCount')
    },
    oldFirst() {
      return quickSort(featuredCommentElements, 'timestampNumber', true)
    },
    newFirst() {
      return quickSort(featuredCommentElements, 'timestampNumber')
    },
  }

  const sortedElements = trinity[sortModeData]()

  // Get all comments that are hidden by the other script if needed
  const hiddenByOtherScript = checkHidden
    ? $('.row.row_reply.clearit').filter(function () {
        return $(this).css('display') === 'none'
      })
    : []

  // Append featured comments
  sortedElements.forEach(function (element) {
    if (checkHidden) {
      // Skip comments that are already hidden by the other script
      const isHidden =
        hiddenByOtherScript.filter(function () {
          return this.id === element.element.id
        }).length > 0

      if (!isHidden) {
        container.append($(element.element))
      }
    } else {
      container.append($(element.element))
    }
  })

  return sortedElements
}

/**
 * Add plain comments container
 */
const addPlainCommentsContainer = (
  plainCommentElements,
  container,
  hidePlainComments,
  checkHidden,
) => {
  // Create plain comments container
  const plainCommentsContainer = $('<div id="comment_list_plain" style="margin-top:2rem;"></div>')
  if (hidePlainComments) {
    plainCommentsContainer.hide()
  }

  // Get all comments that are hidden by the other script if needed
  const hiddenByOtherScript = checkHidden
    ? $('.row.row_reply.clearit').filter(function () {
        return $(this).css('display') === 'none'
      })
    : []

  // Add plain comments to container
  plainCommentElements.forEach(function (element) {
    if (checkHidden) {
      // Skip comments that are already hidden by the other script
      const isHidden =
        hiddenByOtherScript.filter(function () {
          return this.id === element.element.id
        }).length > 0

      if (!isHidden) {
        plainCommentsContainer.append($(element.element))
      }
    } else {
      plainCommentsContainer.append($(element.element))
    }
  })

  container.append(plainCommentsContainer)
}

/**
 * Move the prebroadcast toggle to the top of the page
 */
const movePrebroadcastToggleToTop = (header, otherScriptToggle) => {
  if (otherScriptToggle && otherScriptToggle.length > 0) {
    // Find the separator element
    const separator = otherScriptToggle.find('#comments_seperater')

    if (separator.length > 0) {
      // Clone the separator with its event handlers
      const clonedSeparator = separator.clone(true)

      // Style it to fit in the header
      clonedSeparator.css({
        'margin-left': '10px',
        display: 'inline-block',
      })

      // Add it to the header
      header.append(clonedSeparator)

      // Remove the original toggle from the DOM to prevent duplicates
      otherScriptToggle.remove()

      // Remove any other separators that might exist
      $('.row_state').each(function () {
        if (
          $(this).find('#comments_seperater').length > 0 &&
          !$(this).find('#comments_seperater').closest('h3').length
        ) {
          $(this).remove()
        }
      })
    }
  }
}

;(async function () {
  // Exit early if not on a supported page
  if (!BGM_EP_REGEX.test(location.href) && !BGM_GROUP_REGEX.test(location.href)) {
    return
  }

  // Initialize storage with default values
  Storage.init({
    hidePlainComments: true,
    minimumFeaturedCommentLength: 15,
    maxFeaturedComments: 99,
    sortMode: 'reactionCount',
    stickyMentioned: false,
  })

  // Get user settings from storage
  const userSettings = {
    hidePlainComments: Storage.get('hidePlainComments'),
    minimumFeaturedCommentLength: Storage.get('minimumFeaturedCommentLength'),
    maxFeaturedComments: Storage.get('maxFeaturedComments'),
    sortMode: Storage.get('sortMode'),
    stickyMentioned: Storage.get('stickyMentioned'),
  }

  // Initialize settings dialog
  window.settingsDialog = initSettings(userSettings)

  // Check if the prebroadcast script is active and wait for it to finish
  const otherScriptActive = await waitForPrebroadcastScript()

  // Process comments
  const commentData = processComments(userSettings)

  // Render comments
  renderComments(commentData, userSettings, otherScriptActive)

  // Set up handler for prebroadcast toggle if needed
  if (otherScriptActive) {
    setupPrebroadcastToggleHandler()
  }

  // Listen for settings changes
  document.addEventListener('settingsSaved', function (e) {
    const newSettings = {
      hidePlainComments: userSettings.hidePlainComments,
      minimumFeaturedCommentLength: e.detail.minEffectiveNumber,
      maxFeaturedComments: e.detail.maxSelectedPosts,
      sortMode: e.detail.sortBy,
      stickyMentioned: e.detail.showMine,
    }

    // Re-process and re-render comments with new settings
    const newCommentData = processComments(newSettings)
    renderComments(newCommentData, newSettings, otherScriptActive)
  })
})()
