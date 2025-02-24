export function quickSort(arr, sortKey, changeCompareDirection = false) {
  if (arr.length <= 1) {
    return arr
  }
  const pivot = arr[0]
  const left = []
  const right = []
  for (let i = 1; i < arr.length; i++) {
    const compareResult = !changeCompareDirection
      ? arr[i][sortKey] > pivot[sortKey]
      : arr[i][sortKey] < pivot[sortKey]
    if (arr[i][sortKey] && compareResult) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
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
