/**
 * Build components
 */
import Storage from '../../../storage/index'
function initSettingsContainer(userSettings) {
  const setMinimumFeaturedCommentInput = $(
    `<input type="number" min="0" max="100" step="1" value="${userSettings.minimumFeaturedCommentLength}" style="width: 2rem;margin-left:3px;">`,
  )
  const setMaximumFeaturedCommentsInput = $(
    `<input type="number" min="1" max="100" step="1" value="${userSettings.maxFeaturedComments}" style="width: 2rem;margin-left:3px;" >`,
  )
  const setHidePlainCommentsInput = $(
    `<input type="checkbox"  style="flex:none;margin-right:3px;" id="epe-hide-plain">`,
  ).attr('checked', userSettings.hidePlainComments)
  const settingsContainer = $(`<div style="padding:10px;"></div>`)
  const settingsForm = $(
    '<form style="display:flex; align-items:center; justify-content:flex-start; margin-top:5px;"></form>',
  )
  const settingsLabel = $(
    '<label style="display:inline-block;margin-right:5px;" title="字数不够的评论不会设置为精选，至少为0" >最低有效字数</label>',
  )
  const settingsLabel2 = $(
    '<label style="display:inline-block;margin-right:5px;" title="显示的精选评论数，至少为1，显示\'回复我\'的消息时会无视这个上限" >最大精选评论数</label>',
  )
  const settingsLabel3 = $(
    '<label style="display:inline-flex;align-items:center;margin-right:5px;" title="你可以在最底部点击文字展开普通评论"></label>',
  )
  settingsLabel.append(setMinimumFeaturedCommentInput)
  settingsLabel2.append(setMaximumFeaturedCommentsInput)
  settingsLabel3.append(setHidePlainCommentsInput)
  settingsLabel3.append('折叠普通评论')
  settingsForm.append([settingsLabel, settingsLabel2, settingsLabel3])
  const settingsButton = $('<button>保存</button>')
  const sortMethodForm = $(
    '<div style="width:100%;"><select id="sortMethodSelect" name="reactionCount"><option value="reactionCount">按热度（贴贴数）排序</option><option value="replyCount">按评论数排序</option><option value="oldFirst">按时间排序(最旧在前)</option><option value="newFirst">按时间排序(最新在前)</option></select></div>',
  )

  settingsButton.click(async function () {
    Storage.set(
      'minimumFeaturedCommentLength',
      setMinimumFeaturedCommentInput.val() >= 0 ? setMinimumFeaturedCommentInput.val() : 0,
    )
    Storage.set(
      'maxFeaturedComments',
      setMaximumFeaturedCommentsInput.val() > 0 ? setMaximumFeaturedCommentsInput.val() : 1,
    )
    Storage.set('hidePlainComments', setHidePlainCommentsInput.is(':checked'))
    Storage.set('sortMode', $('#sortMethodSelect').val() || 'reactionCount')
    alert('设置已保存')
    location.reload()
  })

  settingsForm.append(settingsButton)
  settingsContainer.append(sortMethodForm)
  settingsContainer.append(settingsForm)

  return settingsContainer
}

export default initSettingsContainer
