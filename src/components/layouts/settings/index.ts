import type { CommentArea, SettingsElements, UserSettings } from '../../../types/index'

import { CustomCheckboxContainer } from '../../../classes/checkbox'
import { COMMENT_AREAS } from '../../../constants/index'
import { icon } from '../../../icons'
import Storage from '../../../storage/index'
import { getDisabledCommentAreas, setDisabledCommentAreas } from '../../../storage/localSettings'
// @ts-ignore
import styles from './styles.css'

const COMMENT_AREA_LABELS: Record<CommentArea, string> = {
  episode: '单集评论',
  blog: '日志评论',
  groupTopic: '小组话题',
  subjectTopic: '条目讨论',
}

function setCommentAreaDropdownOpen(elements: SettingsElements, open: boolean): void {
  elements.commentAreaDropdown.classList.toggle('open', open)
  elements.commentAreaTrigger.setAttribute('aria-expanded', String(open))
}

function syncCommentAreaSelection(elements: SettingsElements): void {
  let selectedCount = 0
  elements.commentAreaInputs.forEach((input) => {
    if (input.checked) {
      selectedCount += 1
    }
    const option = input.closest('.bce-multi-select-option')
    option?.classList.toggle('selected', input.checked)
  })

  const totalCount = COMMENT_AREAS.length
  if (selectedCount === totalCount) {
    elements.commentAreaSummary.textContent = `全部 ${totalCount} 个区域`
  }
  else if (selectedCount === 0) {
    elements.commentAreaSummary.textContent = '未启用任何区域'
  }
  else {
    elements.commentAreaSummary.textContent = `已选择 ${selectedCount}/${totalCount} 个区域`
  }
}

export function createSettingMenu(
  userSettings: UserSettings,
  episodeMode = false,
  reloadOnSave = false,
): void {
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

    // Comment area scope section
    const scopeSection = document.createElement('div')
    scopeSection.className = 'bce-section'

    const scopeTitle = document.createElement('h3')
    scopeTitle.className = 'bce-section-title'
    scopeTitle.innerHTML = `${icon('list')} 生效范围`
    scopeSection.appendChild(scopeTitle)

    const scopeGroup = document.createElement('div')
    scopeGroup.className = 'bce-form-group'

    const scopeLabel = document.createElement('label')
    scopeLabel.className = 'bce-form-label'
    scopeLabel.textContent = '启用评论区增强的区域'
    scopeLabel.htmlFor = 'bce-comment-area-trigger'

    const commentAreaDropdown = document.createElement('div')
    commentAreaDropdown.className = 'bce-multi-select'

    const commentAreaTrigger = document.createElement('button')
    commentAreaTrigger.type = 'button'
    commentAreaTrigger.id = 'bce-comment-area-trigger'
    commentAreaTrigger.className = 'bce-multi-select-trigger'
    commentAreaTrigger.setAttribute('aria-expanded', 'false')
    commentAreaTrigger.setAttribute('aria-controls', 'bce-comment-area-options')

    const commentAreaSummary = document.createElement('span')
    commentAreaSummary.className = 'bce-multi-select-summary'
    commentAreaTrigger.appendChild(commentAreaSummary)

    const commentAreaMenu = document.createElement('div')
    commentAreaMenu.id = 'bce-comment-area-options'
    commentAreaMenu.className = 'bce-multi-select-menu'
    commentAreaMenu.setAttribute('aria-label', '启用评论区增强的区域')

    const commentAreaInputs = new Map<CommentArea, HTMLInputElement>()
    COMMENT_AREAS.forEach((area) => {
      const option = document.createElement('label')
      option.className = 'bce-multi-select-option selected'

      const input = document.createElement('input')
      input.type = 'checkbox'
      input.value = area
      input.checked = true

      const optionLabel = document.createElement('span')
      optionLabel.textContent = COMMENT_AREA_LABELS[area]

      option.appendChild(input)
      option.appendChild(optionLabel)
      commentAreaMenu.appendChild(option)
      commentAreaInputs.set(area, input)
    })

    const scopeHint = document.createElement('span')
    scopeHint.className = 'bce-field-hint'
    scopeHint.textContent = '仅保存在当前浏览器，不会同步到 Bangumi Riff'

    commentAreaDropdown.appendChild(commentAreaTrigger)
    commentAreaDropdown.appendChild(commentAreaMenu)
    scopeGroup.appendChild(scopeLabel)
    scopeGroup.appendChild(commentAreaDropdown)
    scopeGroup.appendChild(scopeHint)
    scopeSection.appendChild(scopeGroup)
    body.appendChild(scopeSection)

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
      commentAreaDropdown,
      commentAreaTrigger,
      commentAreaSummary,
      commentAreaInputs,
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
      commentAreaInputs,
    } = elements

    const disabledCommentAreas = new Set(getDisabledCommentAreas())
    commentAreaInputs.forEach((input, area) => {
      input.checked = !disabledCommentAreas.has(area)
    })
    syncCommentAreaSelection(elements)

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
      commentAreaInputs,
    } = elements

    const disabledCommentAreas = COMMENT_AREAS.filter(
      area => !commentAreaInputs.get(area)?.checked,
    )
    setDisabledCommentAreas(disabledCommentAreas)

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
      Storage.set(
        'hidePremature',
        hidePrematureCommentsCheckboxContainer.isChecked() ? 'on' : 'off',
      )
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
    if (reloadOnSave) {
      setTimeout(() => location.reload(), 250)
    }
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
    container.style.display = 'flex'

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

    setCommentAreaDropdownOpen(elements, false)

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
    elements.commentAreaTrigger.addEventListener('click', () => {
      const open = elements.commentAreaTrigger.getAttribute('aria-expanded') !== 'true'
      setCommentAreaDropdownOpen(elements, open)
    })
    elements.commentAreaInputs.forEach((input) => {
      input.addEventListener('change', () => syncCommentAreaSelection(elements))
    })
    document.addEventListener('click', (event: MouseEvent) => {
      if (event.target instanceof Node && !elements.commentAreaDropdown.contains(event.target)) {
        setCommentAreaDropdownOpen(elements, false)
      }
    })

    // Close on X button
    const closeBtn = elements.container.querySelector('.bce-modal-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => hideDialog(elements))
    }

    // ESC key to close
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && elements.container.classList.contains('active')) {
        if (elements.commentAreaTrigger.getAttribute('aria-expanded') === 'true') {
          setCommentAreaDropdownOpen(elements, false)
          elements.commentAreaTrigger.focus()
          return
        }
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
