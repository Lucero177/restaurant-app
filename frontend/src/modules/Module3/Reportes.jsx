import { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import InsightsCards from './InsightsCards.jsx'
import VentasDiariasChart from './VentasDiariasChart.jsx'
import EstadoPedidosChart from './EstadoPedidosChart.jsx'
import ParticipacionPlatosChart from './ParticipacionPlatosChart.jsx'
import { exportPedidosToExcel, exportNodeToPdf } from '../../utils/exportUtils.js'
import { BarChart3, FileSpreadsheet, FileDown, Loader2 } from 'lucide-react'

export default function Reportes() {
  const { pedidos } = useData()
  const [exportingPdf, setExportingPdf] = useState(false)

  const handleExportExcel = () => {
    exportPedidosToExcel(pedidos, `pedidos_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      await exportNodeToPdf(
        'reportes-capture',
        `reporte_ejecutivo_${new Date().toISOString().slice(0, 10)}.pdf`,
        'Reporte Ejecutivo — RestoGestión'
      )
    } finally {
      setExportingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-blue-400" size={24} />
            Reportes visuales e insights
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Analítica calculada en tiempo real sobre {pedidos.length} pedidos registrados.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="btn btn-success">
            <FileSpreadsheet size={16} />
            Exportar Excel
          </button>
          <button onClick={handleExportPdf} disabled={exportingPdf} className="btn btn-danger">
            {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            {exportingPdf ? 'Generando...' : 'PDF Ejecutivo'}
          </button>
        </div>
      </div>

      <div id="reportes-capture" className="space-y-6 bg-slate-950 p-1">
        <InsightsCards />

        <VentasDiariasChart />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EstadoPedidosChart />
          <ParticipacionPlatosChart />
        </div>
      </div>
    </div>
  )
}
