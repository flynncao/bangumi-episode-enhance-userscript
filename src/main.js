import { initSettings } from './components/layouts/settings/index'
import { BGM_EP_REGEX, BGM_GROUP_REGEX } from './constants/index'
import processComments from './modules/comments'
import { setupPrebroadcastToggleHandler, waitForPrebroadcastScript } from './modules/compatibility'
import { renderComments } from './modules/rendering'
import Storage from './storage/index'
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

  console.log('window.settingsDialog', window.settingsDialog) // This should now always be an object
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
