import { createButton } from './components/layouts/button'
import { createCheckbox } from './components/layouts/checkbox'
import { BGM_SUBJECT_REGEX } from './constants/index'
import styles from './static/css/styles.css'
import Icons from './static/svg/index'
import Storage from './storage/index'
;(async function () {
  // Validate if the current page is a Bangumi subject page
  if (!BGM_SUBJECT_REGEX.test(location.href)) {
    return
  }

  // Storage
  Storage.init({
    copyJapaneseTitle: false,
    showText: true,
  })

  const userSettings = {
    copyJapaneseTitle: Storage.get('copyJapaneseTitle') || false,
    showText: Storage.get('showText') || true,
  }

  // Layout and Events
  const injectStyles = () => {
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    document.head.append(styleEl)
  }
  injectStyles()

  $('h1.nameSingle').append(
    createButton(
      {
        id: 'bct-copy-title',
        text: '复制',
        icon: Icons.copy,
        className: 'bct-button',
        onClick: () => {
          const title = userSettings.copyJapaneseTitle
            ? $('h1.nameSingle').find('a').text().trim()
            : $('h1.nameSingle').find('a').attr('title')
          navigator.clipboard.writeText(title)
          // eslint-disable-next-line no-alert
          alert(`已复制${userSettings.copyJapaneseTitle ? '日文标题' : '标题'}到剪切板！`)
        },
      },
      userSettings,
    ),
  )

  $('h1.nameSingle').append(
    createCheckbox(
      {
        id: 'bct-hide-plain-comments',
        label: '日文名',
        className: 'bct-checkbox',
        onChange: (e) => {
          userSettings.copyJapaneseTitle = e.target.checked
          Storage.set('copyJapaneseTitle', userSettings.copyJapaneseTitle)
        },
        checked: userSettings.copyJapaneseTitle,
        disabled: false,
      },
      userSettings,
    ),
  )
})()
