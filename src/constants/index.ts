import type { CommentArea } from '../types/index'

export const BGM_EP_REGEX = /^https:\/\/(((fast\.)?bgm\.tv)|(chii\.in)|(bangumi\.tv))\/ep\/\d+/
export const BGM_GROUP_REGEX
  = /^https:\/\/(?:fast\.)?(?:bgm\.tv|chii\.in|bangumi\.tv)\/(?:blog\/(?<blogId>\d+)|(?<topicType>group|subject)\/topic\/(?<topicId>\d+))/
export const COMMENT_AREAS: readonly CommentArea[] = [
  'episode',
  'blog',
  'groupTopic',
  'subjectTopic',
]
export const NAMESPACE = 'bangumi_comment_enhance'

export function getCommentArea(url: string): CommentArea | null {
  if (BGM_EP_REGEX.test(url)) {
    return 'episode'
  }

  const discussionMatch = BGM_GROUP_REGEX.exec(url)
  if (discussionMatch?.groups?.blogId) {
    return 'blog'
  }
  if (discussionMatch?.groups?.topicType === 'group') {
    return 'groupTopic'
  }
  if (discussionMatch?.groups?.topicType === 'subject') {
    return 'subjectTopic'
  }

  return null
}
