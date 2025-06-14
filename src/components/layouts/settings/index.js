import { CustomCheckboxContainer } from '../../../classes/checkbox'
import Icons from '../../../static/svg/index'
import Storage from '../../../storage/index'
import { createNonameHeader } from './header'
import styles from './styles.css'

export function createSettingMenu(userSettings, episodeMode = false) {
  const injectStyles = () => {
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    document.head.append(styleEl)
  }

  const createSettingsDialog = () => {
    const container = document.createElement('div')
    container.className = 'fixed-container'
    // const nonameHeader = document.createElement('div')
    // nonameHeader.className = 'padding-row'
    const nonameHeader = createNonameHeader()

    const dropdownContainer = document.createElement('div')
    dropdownContainer.className = 'dropdown-group'
    const spacerLeft = document.createElement('div')
    spacerLeft.style.width = '24px'
    const dropdown = document.createElement('select')
    dropdown.className = 'dropdown-select'

    const options = [
      { value: 'reactionCount', text: '按热度(贴贴数)排序' },
      { value: 'newFirst', text: '按时间排序(最新在前)' },
      { value: 'oldFirst', text: '按时间排序(最旧在前)' },
      { value: 'replyCount', text: '按评论数排序' },
    ]

    dropdown.append(
      ...options.map((opt) => {
        const option = document.createElement('option')
        option.value = opt.value
        option.textContent = opt.text
        return option
      }),
    )
    dropdown.value = userSettings.sortMode || 'reactionCount'
    const spacerRight = document.createElement('div')
    spacerRight.style.width = '24px'

    dropdownContainer.append($('<strong></strong>').html(Icons.sorting)[0])
    dropdownContainer.append(dropdown)
    dropdownContainer.append(spacerRight)

    // Create checkbox
    const checkboxContainers = []

    const hidePlainCommentsCheckboxContainer = new CustomCheckboxContainer(
      'hidePlainComments',
      '隐藏普通评论',
      userSettings.hidePlainComments || false,
    )

    const pinMyCommentsCheckboxContainer = new CustomCheckboxContainer(
      'showMine',
      '置顶我发表/回复我的帖子',
      userSettings.stickyMentioned || false,
    )

    const hidePrematureCommentsCheckboxContainer = new CustomCheckboxContainer(
      'hidePremature',
      '隐藏开播前发表的评论',
      userSettings.hidePremature || false,
    )

    checkboxContainers.push(
      hidePlainCommentsCheckboxContainer.getContainer(),
      pinMyCommentsCheckboxContainer.getContainer(),
    )

    if (episodeMode) {
      checkboxContainers.push(hidePrematureCommentsCheckboxContainer.getContainer())
    }

    // Create min effective number int
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
    container.append(nonameHeader)
    container.append(dropdownContainer)
    container.append(minEffGroup)
    container.append(maxPostsGroup)
    container.append(...checkboxContainers)
    container.append(spaceHr)
    container.append(buttonGroup)

    // Add to document
    document.body.append(container)

    return {
      container,
      dropdown,
      pinMyCommentsCheckboxContainer,
      hidePlainCommentsCheckboxContainer,
      hidePrematureCommentsCheckboxContainer,
      minEffInput,
      maxPostsInput,
      cancelBtn,
      saveBtn,
    }
  }
  // Initialize settings from localStorage
  const initSettings = (elements) => {
    const {
      dropdown,
      pinMyCommentsCheckboxContainer,
      hidePlainCommentsCheckboxContainer,
      hidePrematureCommentsCheckboxContainer,
      minEffInput,
      maxPostsInput,
    } = elements

    if (localStorage.getItem('sortBy')) {
      dropdown.value = localStorage.getItem('sortBy')
    }

    if (localStorage.getItem('showMine') !== null) {
      pinMyCommentsCheckboxContainer.getInput().checked =
        localStorage.getItem('showMine') === 'true'
    }

    if (localStorage.getItem('hidePremature') !== null) {
      hidePrematureCommentsCheckboxContainer.getInput().checked =
        localStorage.getItem('hidePremature') === 'true'
    }

    if (localStorage.getItem('hidePlainComments') !== null) {
      hidePlainCommentsCheckboxContainer.getInput().checked =
        localStorage.getItem('hidePlainComments') === 'true'
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
    const {
      container,
      dropdown,
      pinMyCommentsCheckboxContainer,
      hidePrematureCommentsCheckboxContainer,
      hidePlainCommentsCheckboxContainer,
      minEffInput,
      maxPostsInput,
    } = elements

    Storage.set(
      'minimumFeaturedCommentLength',
      Math.max(Number.parseInt(minEffInput.value) || 0, 0),
    )
    Storage.set(
      'maxFeaturedComments',
      Number.parseInt(maxPostsInput.value) > 0 ? Number.parseInt(maxPostsInput.value) : 1,
    )

    Storage.set('hidePlainComments', hidePlainCommentsCheckboxContainer.getInput().checked)
    Storage.set('stickyMentioned', pinMyCommentsCheckboxContainer.getInput().checked)
    Storage.set('sortMode', dropdown.value)
    Storage.set('stickyMentioned', pinMyCommentsCheckboxContainer.getInput().checked)

    if (episodeMode) {
      Storage.set('hidePremature', hidePrematureCommentsCheckboxContainer.getInput().checked)
    }

    // Trigger custom event
    const event = new CustomEvent('settingsSaved')
    document.dispatchEvent(event)

    // jQuery compatibility
    if (window.jQuery) {
      jQuery(document).trigger('settingsSaved')
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
    // Inject the styles
    injectStyles()
    // Create the dialog
    const elements = createSettingsDialog()
    // Initialize settings
    initSettings(elements)

    // Setup event listeners
    elements.saveBtn.addEventListener('click', () => saveSettings(elements))
    elements.cancelBtn.addEventListener('click', () => hideDialog(elements.container))

    // // Add window resize handler to center the dialog when window is resized
    // window.addEventListener('resize', () => {
    //   if (elements.container.style.display === 'block') {
    //     elements.container.style.left = '50%'
    //     elements.container.style.top = '50%'
    //     elements.container.style.transform = 'translate(-50%, -50%)'
    //   }
    // })

    // Expose API
    window.BCE.settingsDialog = {
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
