export function formatCurrency(value) {
  return `S/ ${Number(value || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return dateStr
  }
}
