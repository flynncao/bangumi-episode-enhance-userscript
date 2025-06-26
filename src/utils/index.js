// quickSort is not strictly needed cause JavaScript has built-in sort method based on quicksort/selection algorithm
export function quickSort(arr, sortKey, changeCompareDirection = false) {
  if (arr.length <= 1) {
    return arr
  }
  const pivot = arr[0]
  const left = []
  const right = []
  for (let i = 1; i < arr.length; i++) {
    const element = arr[i]
    const elementImportant = element.important || false
    const pivotImportant = pivot.important || false
    let compareResult

    if (elementImportant !== pivotImportant) {
      compareResult = elementImportant // true if element is important and pivot is not
    } else if (changeCompareDirection) {
      compareResult = element[sortKey] < pivot[sortKey]
    } else {
      compareResult = element[sortKey] > pivot[sortKey]
    }

    if (compareResult) {
      left.push(element)
    } else {
      right.push(element)
    }
  }
  return quickSort(left, sortKey, changeCompareDirection).concat(
    pivot,
    quickSort(right, sortKey, changeCompareDirection),
  )
}
export function purifiedDatetimeInMillionSeconds(timestamp) {
  return new Date(timestamp.trim().replace('- ', '')).getTime()
}

export function defaultSort(arr, sortKey, changeCompareDirection = false) {
  console.log('sortKey', sortKey)
  console.log('arr', arr)
  return arr.sort((a, b) => {
    const aImportant = a.important || false
    const bImportant = b.important || false
    if (aImportant !== bImportant) {
      return aImportant ? -1 : 1
    }
    if (changeCompareDirection) {
      return a[sortKey] - b[sortKey]
    }
    return b[sortKey] - a[sortKey]
  })
}
