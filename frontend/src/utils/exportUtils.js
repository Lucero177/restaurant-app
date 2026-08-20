import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Exporta el listado de pedidos (con totales) a un archivo Excel (.xlsx)
 */
export function exportPedidosToExcel(pedidos, fileName = 'pedidos_restogestion.xlsx') {
  const rows = pedidos.map((p) => ({
    Fecha: p.fecha,
    Hora: p.hora,
    Plato: p.plato,
    Cantidad: p.cantidad,
    'Precio Unitario': p.precioUnitario,
    'Descuento %': p.descuentoPct,
    'Descuento S/': p.descuentoMonto,
    'Subtotal Bruto': Number(p.bruto?.toFixed(2)),
    'Descuento Aplicado': Number(p.descuentoAplicado?.toFixed(2)),
    'Total Final': Number(p.total?.toFixed(2)),
    Estado: p.estado,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pedidos')
  XLSX.writeFile(wb, fileName)
}

/**
 * Exporta cualquier nodo del DOM (dashboard de reportes) como PDF ejecutivo,
 * capturando gráficos e insights tal como se ven en pantalla.
 */
export async function exportNodeToPdf(nodeId, fileName = 'reporte_ejecutivo.pdf', title = 'Reporte Ejecutivo') {
  const node = document.getElementById(nodeId)
  if (!node) return

  const canvas = await html2canvas(node, {
    backgroundColor: '#0f172a',
    scale: 2,
    useCORS: true,
  })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  pdf.setFillColor(15, 23, 42)
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(16)
  pdf.text(title, 14, 15)
  pdf.setFontSize(9)
  pdf.setTextColor(148, 163, 184)
  pdf.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 14, 21)

  const imgWidth = pageWidth - 20
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let heightLeft = imgHeight
  let position = 26

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
  heightLeft -= pageHeight - position

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.setFillColor(15, 23, 42)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(fileName)
}
