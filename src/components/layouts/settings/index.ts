import type { UserSettings } from '../../../types/index'
import { CustomCheckboxContainer } from '../../../classes/checkbox'
import Storage from '../../../storage/index'
// @ts-ignore
import styles from './styles.css'

interface SettingsElements {
  overlay: HTMLDivElement
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

// SVG icons for the modal
const ModalIcons = {
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  sort: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
}

export function createSettingMenu(userSettings: UserSettings, episodeMode = false) {
  const injectStyles = () => {
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    document.head.append(styleEl)
  }

  const createSettingsDialog = () => {
    // Create backdrop overlay
    const overlay = document.createElement('div')
    overlay.className = 'bce-modal-overlay'

    // Create modal container
    const container = document.createElement('div')
    container.className = 'bce-modal'

    // Create header
    const header = document.createElement('div')
    header.className = 'bce-modal-header'

    const title = document.createElement('h2')
    title.className = 'bce-modal-title'
    title.innerHTML = `${ModalIcons.settings} 评论增强设置`

    const closeBtn = document.createElement('button')
    closeBtn.className = 'bce-modal-close'
    closeBtn.innerHTML = ModalIcons.close
    closeBtn.setAttribute('aria-label', '关闭')

    header.appendChild(title)
    header.appendChild(closeBtn)

    // Create body
    const body = document.createElement('div')
    body.className = 'bce-modal-body'

    // Sorting Section
    const sortSection = document.createElement('div')
    sortSection.className = 'bce-section'

    const sortTitle = document.createElement('h3')
    sortTitle.className = 'bce-section-title'
    sortTitle.innerHTML = `${ModalIcons.sort} 排序方式`
    sortSection.appendChild(sortTitle)

    const sortGroup = document.createElement('div')
    sortGroup.className = 'bce-form-group'

    const selectWrapper = document.createElement('div')
    selectWrapper.className = 'bce-select-wrapper'

    const dropdown = document.createElement('select')
    dropdown.className = 'bce-select'

    const options = [
      { value: 'reactionCount', text: '按热度（贴贴数）排序' },
      { value: 'newFirst', text: '按时间排序（最新在前）' },
      { value: 'oldFirst', text: '按时间排序（最旧在前）' },
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

    selectWrapper.appendChild(dropdown)
    sortGroup.appendChild(selectWrapper)
    sortSection.appendChild(sortGroup)
    body.appendChild(sortSection)

    // Display Options Section
    const displaySection = document.createElement('div')
    displaySection.className = 'bce-section'

    const displayTitle = document.createElement('h3')
    displayTitle.className = 'bce-section-title'
    displayTitle.innerHTML = `${ModalIcons.list} 显示选项`
    displaySection.appendChild(displayTitle)

    // Number inputs group
    const numbersGroup = document.createElement('div')
    numbersGroup.className = 'bce-form-group'

    // Min effective length
    const minEffLabel = document.createElement('label')
    minEffLabel.className = 'bce-form-label'
    minEffLabel.textContent = '最低有效字数'

    const minEffWrapper = document.createElement('div')
    minEffWrapper.className = 'bce-input-wrapper'

    const minEffInput = document.createElement('input')
    minEffInput.type = 'number'
    minEffInput.className = 'bce-number-input'
    minEffInput.min = '0'
    minEffInput.value = (userSettings.minimumFeaturedCommentLength || 0).toString()

    const minEffHint = document.createElement('span')
    minEffHint.className = 'bce-input-hint'
    minEffHint.textContent = '字数少于该值的评论将被折叠'

    minEffWrapper.appendChild(minEffInput)
    minEffWrapper.appendChild(minEffHint)
    numbersGroup.appendChild(minEffLabel)
    numbersGroup.appendChild(minEffWrapper)
    displaySection.appendChild(numbersGroup)

    // Max featured comments
    const maxPostsGroup = document.createElement('div')
    maxPostsGroup.className = 'bce-form-group'

    const maxPostsLabel = document.createElement('label')
    maxPostsLabel.className = 'bce-form-label'
    maxPostsLabel.textContent = '最大精选评论数'

    const maxPostsWrapper = document.createElement('div')
    maxPostsWrapper.className = 'bce-input-wrapper'

    const maxPostsInput = document.createElement('input')
    maxPostsInput.type = 'number'
    maxPostsInput.className = 'bce-number-input'
    maxPostsInput.min = '1'
    maxPostsInput.value = (userSettings.maxFeaturedComments || 1).toString()

    const maxPostsHint = document.createElement('span')
    maxPostsHint.className = 'bce-input-hint'
    maxPostsHint.textContent = '精选评论的最大显示数量'

    maxPostsWrapper.appendChild(maxPostsInput)
    maxPostsWrapper.appendChild(maxPostsHint)
    maxPostsGroup.appendChild(maxPostsLabel)
    maxPostsGroup.appendChild(maxPostsWrapper)
    displaySection.appendChild(maxPostsGroup)

    body.appendChild(displaySection)

    // Filter Section
    const filterSection = document.createElement('div')
    filterSection.className = 'bce-section'

    const filterTitle = document.createElement('h3')
    filterTitle.className = 'bce-section-title'
    filterTitle.innerHTML = `${ModalIcons.filter} 过滤选项`
    filterSection.appendChild(filterTitle)

    // Create checkboxes
    const hidePlainCommentsCheckboxContainer = new CustomCheckboxContainer(
      'hidePlainComments',
      '隐藏普通评论',
      '仅显示精选评论，折叠低互动内容',
      ModalIcons.eye,
      userSettings.hidePlainComments || false,
    )

    const pinMyCommentsCheckboxContainer = new CustomCheckboxContainer(
      'showMine',
      '置顶我的评论',
      '将我发表或回复我的帖子置顶显示',
      ModalIcons.user,
      userSettings.stickyMentioned || false,
    )

    const hidePrematureCommentsCheckboxContainer = new CustomCheckboxContainer(
      'hidePremature',
      '隐藏开播前评论',
      '隐藏剧集开播前发表的评论（仅单集页面）',
      ModalIcons.calendar,
      userSettings.hidePremature || false,
    )

    filterSection.appendChild(hidePlainCommentsCheckboxContainer.getContainer())
    filterSection.appendChild(pinMyCommentsCheckboxContainer.getContainer())

    if (episodeMode) {
      filterSection.appendChild(hidePrematureCommentsCheckboxContainer.getContainer())
    }

    body.appendChild(filterSection)

    // Create footer
    const footer = document.createElement('div')
    footer.className = 'bce-modal-footer'

    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'bce-btn bce-btn-secondary'
    cancelBtn.textContent = '取消'

    const saveBtn = document.createElement('button')
    saveBtn.className = 'bce-btn bce-btn-primary'
    saveBtn.textContent = '保存设置'

    footer.appendChild(cancelBtn)
    footer.appendChild(saveBtn)

    // Assemble modal
    container.appendChild(header)
    container.appendChild(body)
    container.appendChild(footer)

    // Add to document
    document.body.append(overlay)
    document.body.append(container)

    // // Setup drag functionality
    // let isDragging = false
    // let startX = 0
    // let startY = 0
    // let startLeft = 0
    // let startTop = 0

    // header.addEventListener('mousedown', (event: MouseEvent) => {
    //   // Don't drag if clicking close button
    //   if ((event.target as HTMLElement).closest('.bce-modal-close'))
    //     return

    //   event.preventDefault()
    //   isDragging = true

    //   startX = event.clientX
    //   startY = event.clientY

    //   // Get current visual position using getBoundingClientRect
    //   const rect = container.getBoundingClientRect()
    //   const currentLeft = rect.left + window.scrollX
    //   const currentTop = rect.top + window.scrollY

    //   // Store starting position for delta calculation
    //   startLeft = currentLeft
    //   startTop = currentTop

    //   // Switch from transform-based centering to absolute positioning
    //   // Must set left/top BEFORE removing transform to prevent jump
    //   container.style.left = `${currentLeft}px`
    //   container.style.top = `${currentTop}px`
    //   container.style.transform = 'none'
    //   // Ensure margin is reset since we're using absolute positioning
    //   container.style.margin = '0'

    //   document.body.style.userSelect = 'none'
    // })

    // document.addEventListener('mousemove', (event: MouseEvent) => {
    //   if (!isDragging)
    //     return

    //   const deltaX = event.clientX - startX
    //   const deltaY = event.clientY - startY

    //   const newLeft = startLeft + deltaX
    //   const newTop = startTop + deltaY

    //   // Keep within viewport bounds (allow partial off-screen but not complete disappearance)
    //   const containerWidth = container.offsetWidth
    //   const containerHeight = container.offsetHeight
    //   const minVisible = 50 // Minimum pixels that must remain visible

    //   const clampedLeft = Math.max(-containerWidth + minVisible, Math.min(newLeft, window.innerWidth - minVisible))
    //   const clampedTop = Math.max(0, Math.min(newTop, window.innerHeight - minVisible))

    //   container.style.left = `${clampedLeft}px`
    //   container.style.top = `${clampedTop}px`
    // })

    // document.addEventListener('mouseup', () => {
    //   if (isDragging) {
    //     isDragging = false
    //     document.body.style.userSelect = ''
    //   }
    // })

    return {
      overlay,
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

  // Initialize settings from Storage
  const initSettings = (elements: SettingsElements) => {
    const {
      dropdown,
      pinMyCommentsCheckboxContainer,
      hidePlainCommentsCheckboxContainer,
      hidePrematureCommentsCheckboxContainer,
      minEffInput,
      maxPostsInput,
    } = elements

    const sortMode = Storage.get('sortMode')
    if (sortMode) {
      dropdown.value = sortMode
    }

    const stickyMentioned = Storage.get('stickyMentioned')
    if (stickyMentioned !== undefined) {
      pinMyCommentsCheckboxContainer.setChecked(stickyMentioned)
    }

    const hidePremature = Storage.get('hidePremature')
    if (hidePremature !== undefined && episodeMode) {
      hidePrematureCommentsCheckboxContainer.setChecked(hidePremature)
    }

    const hidePlainComments = Storage.get('hidePlainComments')
    if (hidePlainComments !== undefined) {
      hidePlainCommentsCheckboxContainer.setChecked(hidePlainComments)
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
      overlay,
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

    Storage.set('hidePlainComments', hidePlainCommentsCheckboxContainer.isChecked())
    Storage.set('stickyMentioned', pinMyCommentsCheckboxContainer.isChecked())
    Storage.set('sortMode', dropdown.value)

    if (episodeMode) {
      Storage.set('hidePremature', hidePrematureCommentsCheckboxContainer.isChecked())
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

    hideDialog(elements)
  }

  // Show dialog with animation
  const showDialog = (elements: SettingsElements) => {
    const { overlay, container } = elements

    // Refresh settings before showing
    initSettings(elements)

    // Calculate scrollbar width and prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.paddingRight = `${scrollbarWidth}px`

    // Show elements
    overlay.style.display = 'block'
    container.style.display = 'block'

    // Trigger reflow for animation
    void overlay.offsetWidth
    void container.offsetWidth

    // Add active class for animation
    requestAnimationFrame(() => {
      overlay.classList.add('active')
      container.classList.add('active')
    })

    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  }

  // Hide dialog with animation
  const hideDialog = (elements: SettingsElements) => {
    const { overlay, container } = elements

    // Remove active class for exit animation
    overlay.classList.remove('active')
    container.classList.remove('active')

    // Wait for animation to complete before hiding
    setTimeout(() => {
      overlay.style.display = 'none'
      container.style.display = 'none'
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }, 250)
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
    elements.cancelBtn.addEventListener('click', () => hideDialog(elements))
    elements.overlay.addEventListener('click', () => hideDialog(elements))

    // Close on X button
    const closeBtn = elements.container.querySelector('.bce-modal-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => hideDialog(elements))
    }

    // ESC key to close
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && elements.container.classList.contains('active')) {
        hideDialog(elements)
      }
    })

    // Expose API
    window.BCE = window.BCE || {}
    window.BCE.settingsDialog = {
      show: () => showDialog(elements),
      hide: () => hideDialog(elements),
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
