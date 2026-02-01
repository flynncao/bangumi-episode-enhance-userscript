import type { UserSettings } from '../../../types/index'
import { CustomCheckboxContainer } from '../../../classes/checkbox'
import Icons from '../../../static/svg/index'
import Storage from '../../../storage/index'
import { createNonameHeader } from './header'
// @ts-ignore
import styles from './styles.css'

interface SettingsElements {
  container: HTMLDivElement
  dropdown: HTMLSelectElement
  pinMyCommentsCheckboxContainer: CustomCheckboxContainer
  hidePlainCommentsCheckboxContainer: CustomCheckboxContainer
  hidePrematureCommentsCheckboxContainer: CustomCheckboxContainer
  minEffInput: HTMLInputElement
  maxPostsInput: HTMLInputElement
  cancelBtn: HTMLButtonElement
  saveBtn: HTMLButtonElement
}

export function createSettingMenu(userSettings: UserSettings, episodeMode = false) {
  const injectStyles = () => {
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    document.head.append(styleEl)
  }

  const createSettingsDialog = () => {
    const container = document.createElement('div')
    container.className = 'fixed-container'
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

    const sortingIcon = $('<strong></strong>').html(Icons.sorting || '')[0]
    if (sortingIcon) {
      dropdownContainer.append(sortingIcon)
    }
    dropdownContainer.append(dropdown)
    dropdownContainer.append(spacerRight)

    // Create checkbox
    const checkboxContainers: HTMLElement[] = []

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
    minEffInput.value = (userSettings.minimumFeaturedCommentLength || 0).toString()

    const fontIcon = $('<strong></strong>').html(Icons.font || '')[0]
    if (fontIcon) {
      minEffGroup.append(fontIcon)
    }
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
    maxPostsInput.value = (userSettings.maxFeaturedComments || 1).toString()

    const answerSheetIcon = $('<strong></strong>').html(Icons.answerSheet || '')[0]
    if (answerSheetIcon) {
      maxPostsGroup.append(answerSheetIcon)
    }
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

  // Initialize settings from Storage (refreshes UI when dialog opens)
  const initSettings = (elements: SettingsElements) => {
    const {
      dropdown,
      pinMyCommentsCheckboxContainer,
      hidePlainCommentsCheckboxContainer,
      hidePrematureCommentsCheckboxContainer,
      minEffInput,
      maxPostsInput,
    } = elements

    // Read from Storage class to get latest values (including CloudStorage updates)
    const sortMode = Storage.get('sortMode')
    if (sortMode) {
      dropdown.value = sortMode
    }

    const stickyMentioned = Storage.get('stickyMentioned')
    if (stickyMentioned !== undefined) {
      pinMyCommentsCheckboxContainer.getInput()!.checked = stickyMentioned
    }

    const hidePremature = Storage.get('hidePremature')
    if (hidePremature !== undefined) {
      hidePrematureCommentsCheckboxContainer.getInput()!.checked = hidePremature
    }

    const hidePlainComments = Storage.get('hidePlainComments')
    if (hidePlainComments !== undefined) {
      hidePlainCommentsCheckboxContainer.getInput()!.checked = hidePlainComments
    }

    const minimumFeaturedCommentLength = Storage.get('minimumFeaturedCommentLength')
    if (minimumFeaturedCommentLength !== undefined) {
      minEffInput.value = minimumFeaturedCommentLength.toString()
    }

    const maxFeaturedComments = Storage.get('maxFeaturedComments')
    if (maxFeaturedComments !== undefined) {
      maxPostsInput.value = maxFeaturedComments.toString()
    }
  }

  // Save settings
  const saveSettings = (elements: SettingsElements) => {
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

    Storage.set('hidePlainComments', hidePlainCommentsCheckboxContainer.getInput()!.checked)
    Storage.set('stickyMentioned', pinMyCommentsCheckboxContainer.getInput()!.checked)
    Storage.set('sortMode', dropdown.value)
    Storage.set('stickyMentioned', pinMyCommentsCheckboxContainer.getInput()!.checked)

    if (episodeMode) {
      Storage.set('hidePremature', hidePrematureCommentsCheckboxContainer.getInput()!.checked)
    }

    // Trigger custom event
    const event = new CustomEvent('settingsSaved')
    document.dispatchEvent(event)

    // jQuery compatibility
    // @ts-ignore
    if (window.jQuery) {
      // @ts-ignore
      jQuery(document).trigger('settingsSaved')
    }

    hideDialog(container)
  }

  // Show dialog and refresh settings from Storage
  const showDialog = (container: HTMLDivElement, elements: SettingsElements) => {
    // Refresh all UI elements with latest values from Storage
    initSettings(elements)
    container.style.display = 'block'
  }

  // Hide dialog
  const hideDialog = (container: HTMLDivElement) => {
    container.style.display = 'none'
  }

  // Main initialization function
  const init = () => {
    // Inject the styles
    injectStyles()
    // Create the dialog
    const elements: SettingsElements = createSettingsDialog()
    // Initialize settings
    initSettings(elements)

    // Setup event listeners
    elements.saveBtn.addEventListener('click', () => saveSettings(elements))
    elements.cancelBtn.addEventListener('click', () => hideDialog(elements.container))

    // Expose API
    window.BCE = window.BCE || {}
    window.BCE.settingsDialog = {
      show: () => showDialog(elements.container, elements),
      hide: () => hideDialog(elements.container),
      save: () => saveSettings(elements),
      getElements: () => elements,
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  }
  else {
    init()
  }
}
