import type { UserSettings } from '../../../types/index'
import { CustomCheckboxContainer } from '../../../classes/checkbox'
import { icon } from '../../../icons'
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
    title.innerHTML = `${icon('settings')} 评论增强设置`

    const closeBtn = document.createElement('button')
    closeBtn.className = 'bce-modal-close'
    closeBtn.innerHTML = icon('x')
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
    sortTitle.innerHTML = `${icon('arrow-down-up')} 排序方式`
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
    displayTitle.innerHTML = `${icon('list')} 显示选项`
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
    filterTitle.innerHTML = `${icon('filter')} 过滤选项`
    filterSection.appendChild(filterTitle)

    // Create checkboxes
    const hidePlainCommentsCheckboxContainer = new CustomCheckboxContainer(
      'hidePlainComments',
      '隐藏普通评论',
      '仅显示精选评论，折叠低互动内容',
      'eye',
      userSettings.hidePlainComments || false,
    )

    const pinMyCommentsCheckboxContainer = new CustomCheckboxContainer(
      'showMine',
      '置顶我的评论',
      '将我发表或回复我的帖子置顶显示',
      'user-round',
      userSettings.stickyMentioned || false,
    )

    const hidePrematureCommentsCheckboxContainer = new CustomCheckboxContainer(
      'hidePremature',
      '隐藏开播前评论',
      '隐藏剧集开播前发表的评论（仅单集页面）',
      'calendar-days',
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

    const stickyMentioned: boolean = Storage.get('stickyMentioned') === 'on'
    if (stickyMentioned !== undefined) {
      pinMyCommentsCheckboxContainer.setChecked(stickyMentioned)
    }

    const hidePremature = Storage.get('hidePremature') === 'on'
    if (hidePremature !== undefined && episodeMode) {
      hidePrematureCommentsCheckboxContainer.setChecked(hidePremature)
    }

    const hidePlainComments = Storage.get('hidePlainComments') === 'on'
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

    Storage.set('hidePlainComments', hidePlainCommentsCheckboxContainer.isChecked() ? 'on' : 'off')
    Storage.set('stickyMentioned', pinMyCommentsCheckboxContainer.isChecked() ? 'on' : 'off')
    Storage.set('sortMode', dropdown.value)

    if (episodeMode) {
      Storage.set('hidePremature', hidePrematureCommentsCheckboxContainer.isChecked() ? 'on' : 'off')
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
