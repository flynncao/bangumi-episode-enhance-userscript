import type { CommentElement } from '../types/index'

// quickSort is not strictly needed cause JavaScript has built-in sort method based on quicksort/selection algorithm
export function quickSort(
  arr: CommentElement[],
  sortKey: keyof CommentElement,
  changeCompareDirection = false,
): CommentElement[] {
  if (arr.length <= 1) {
    return arr
  }
  const pivot = arr[0]!
  const left: CommentElement[] = []
  const right: CommentElement[] = []
  for (let i = 1; i < arr.length; i++) {
    const element = arr[i]!
    const elementImportant = element.important || false
    const pivotImportant = pivot.important || false
    let compareResult: boolean

    if (elementImportant !== pivotImportant) {
      compareResult = elementImportant // true if element is important and pivot is not
    }
    else if (changeCompareDirection) {
      compareResult = (element[sortKey] as number) < (pivot[sortKey] as number)
    }
    else {
      compareResult = (element[sortKey] as number) > (pivot[sortKey] as number)
    }

    if (compareResult) {
      left.push(element)
    }
    else {
      right.push(element)
    }
  }
  return [
    ...quickSort(left, sortKey, changeCompareDirection),
    pivot,
    ...quickSort(right, sortKey, changeCompareDirection),
  ]
}

export function purifiedDatetimeInMillionSeconds(timestamp: string) {
  return new Date(timestamp.trim().replace('- ', '')).getTime()
}

export function defaultSort(
  arr: CommentElement[],
  sortKey: keyof CommentElement,
  changeCompareDirection = false,
) {
  console.log('sortKey', sortKey)
  console.log('arr', arr)
  return arr.sort((a, b) => {
    const aImportant = a.important || false
    const bImportant = b.important || false
    if (aImportant !== bImportant) {
      return aImportant ? -1 : 1
    }
    if (changeCompareDirection) {
      return (a[sortKey] as number) - (b[sortKey] as number)
    }
    return (b[sortKey] as number) - (a[sortKey] as number)
  })
}
