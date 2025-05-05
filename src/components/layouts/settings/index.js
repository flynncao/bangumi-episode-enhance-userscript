import Icons from '../../../static/svg/index'
import Storage from '../../../storage/index'
export function initSettings(userSettings) {
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

    hideDialog(container)

    location.reload(true)
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
    return {
      show: () => showDialog(elements.container),
      hide: () => hideDialog(elements.container),
      save: () => saveSettings(elements),
      getElements: () => elements,
    }
  }

  // Create a settings dialog object that will be returned immediately
  let settingsDialog = null

  // Initialize immediately if DOM is ready
  if (document.readyState !== 'loading') {
    settingsDialog = init()
  } else {
    // Create a placeholder object with methods that will initialize when needed
    settingsDialog = {
      show: () => {
        // Replace this object with the real one when first used
        settingsDialog = init()
        settingsDialog.show()
      },
      hide: () => {
        settingsDialog = init()
        settingsDialog.hide()
      },
      save: () => {
        settingsDialog = init()
        settingsDialog.save()
      },
      getElements: () => {
        settingsDialog = init()
        return settingsDialog.getElements()
      },
    }

    // Also set up the event listener to initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      // Replace the placeholder with the real implementation
      settingsDialog = init()
    })
  }

  // Always return an object with the required methods
  return settingsDialog
}
