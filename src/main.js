import { createButton } from './components/layouts/button/index'
import { BGM_SUBJECT_REGEX } from './constants/index'
import styles from './static/css/styles.css'
import Icons from './static/svg/index'
import Storage from './storage/index'
;(async function () {
  // Validate if the current page is a Bangumi subject page
  if (!BGM_SUBJECT_REGEX.test(location.href)) {
    return
  }
  // // Initiate the storage
  Storage.init({
    showText: false,
  })

  const userSettings = {
    showText: Storage.get('hidePlainComments') || true,
  }

  const injectStyles = () => {
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    document.head.append(styleEl)
  }
  injectStyles()

  // Create a button to copy the title using jQuery
  $('h1.nameSingle').append(
    createButton(
      {
        id: 'bct-copy-title',
        text: '复制',
        icon: Icons.copy,
        className: 'bct-button',
        onClick: () => {
          const title = $('h1.nameSingle').find('a').attr('title')
          navigator.clipboard.writeText(title)
          alert('复制番剧名成功！')
        },
      },
      userSettings,
    ),
  )

  // // Trigger the settings saved event
  // $(document).on('settingsSaved', () => {
  //   location.reload()
  // })
})()
