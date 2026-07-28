import type { CommentArea } from '../types/index'

import { COMMENT_AREAS } from '../constants/index'
import Storage from './index'

const DISABLED_COMMENT_AREAS_KEY = 'disabledCommentAreas'

export function getDisabledCommentAreas(): CommentArea[] {
  const storedAreas = Storage.getLocal<unknown>(DISABLED_COMMENT_AREAS_KEY, [])
  if (!Array.isArray(storedAreas)) {
    return []
  }

  return COMMENT_AREAS.filter(area => storedAreas.includes(area))
}

export function setDisabledCommentAreas(areas: readonly CommentArea[]): void {
  const normalizedAreas = COMMENT_AREAS.filter(area => areas.includes(area))
  Storage.setLocal(DISABLED_COMMENT_AREAS_KEY, normalizedAreas)
}

export function setCommentAreaEnabled(area: CommentArea, enabled: boolean): void {
  const disabledAreas = new Set(getDisabledCommentAreas())
  if (enabled) {
    disabledAreas.delete(area)
  }
  else {
    disabledAreas.add(area)
  }
  setDisabledCommentAreas([...disabledAreas])
}
