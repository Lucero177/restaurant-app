import CargaMasiva from './CargaMasiva.jsx'
import TablaPedidos from './TablaPedidos.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatCurrency } from '../../utils/format.js'
import { ClipboardList, TrendingUp } from 'lucide-react'

export default function GestionPedidos() {
  const { kpis } = useData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c111d]/70 p-6 rounded-2xl border border-[#1e2942]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-fire"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="text-[#ff5400]" size={28} />
            Carga, registro y gestión de pedidos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sincronización en tiempo real entre inventario, dashboard y reportes.
          </p>
        </div>

        <div className="bg-[#141c2e] px-4 py-2.5 rounded-xl border border-[#1e2942] text-right">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ventas totales</p>
          <p className="text-xl font-black bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent font-mono flex items-center gap-1 justify-end">
            <TrendingUp size={16} className="text-[#00ff88]" />
            {formatCurrency(kpis.ventasTotales)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CargaMasiva />
        </div>
        <div className="lg:col-span-2">
          <TablaPedidos />
        </div>
      </div>
    </div>
  )
}