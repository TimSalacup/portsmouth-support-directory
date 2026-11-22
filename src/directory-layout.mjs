export function columnsForWidth(width) {
  return width >= 1024 ? 3 : width >= 640 ? 2 : 1
}

export function categoryPosition(index, columns, selectedIndex = null) {
  const row = Math.floor(index / columns) + 1
  return {
    column: index % columns + 1,
    row: row + (columns === 1 && selectedIndex !== null && index > selectedIndex ? 1 : 0),
  }
}
