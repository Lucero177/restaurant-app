import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import KpiCard from '../../components/UI/KpiCard.jsx'
import { formatCurrency } from '../../utils/format.js'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { LayoutDashboard, Flame, ShoppingBag, Wallet, Utensils } from 'lucide-react'

export default function DashboardOperativo() {
  const { pedidos, kpis } = useData()
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroPlato, setFiltroPlato] = useState('Todos')

  const platosUnicos = useMemo(() => ['Todos', ...new Set(pedidos.map((p) => p.plato))], [pedidos])

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const matchesFecha = !filtroFecha || p.fecha === filtroFecha
      const matchesPlato = filtroPlato === 'Todos' || p.plato === filtroPlato
      return matchesFecha && matchesPlato
    })
  }, [pedidos, filtroFecha, filtroPlato])

  // KPIs recalculados según filtros activos (actualización instantánea)
  const kpisFiltrados = useMemo(() => {
    const totalPedidos = pedidosFiltrados.length
    const ventasTotales = pedidosFiltrados.reduce((acc, p) => acc + p.total, 0)
    const conteoPorPlato = {}
    pedidosFiltrados.forEach((p) => {
      conteoPorPlato[p.plato] = (conteoPorPlato[p.plato] || 0) + p.cantidad
    })
    const platoMasVendido = Object.entries(conteoPorPlato).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    return { totalPedidos, ventasTotales, platoMasVendido }
  }, [pedidosFiltrados])

  const horasPico = useMemo(() => {
    const buckets = {}
    pedidosFiltrados.forEach((p) => {
      const h = (p.hora || '00:00').split(':')[0] + ':00'
      buckets[h] = (buckets[h] || 0) + 1
    })
    return Object.entries(buckets)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hora, pedidos]) => ({ hora, pedidos }))
  }, [pedidosFiltrados])

  const maxHora = horasPico.reduce((max, h) => (h.pedidos > max.pedidos ? h : max), { pedidos: 0 })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="text-blue-400" size={24} />
            Dashboard operativo
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Datos en tiempo real desde el módulo de pedidos. {kpis.totalPedidos} registros totales en el sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="input"
          />
          <select value={filtroPlato} onChange={(e) => setFiltroPlato(e.target.value)} className="input">
            {platosUnicos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {(filtroFecha || filtroPlato !== 'Todos') && (
            <button
              onClick={() => {
                setFiltroFecha('')
                setFiltroPlato('Todos')
              }}
              className="btn btn-secondary"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Plato más vendido"
          value={kpisFiltrados.platoMasVendido}
          icon={Utensils}
          accent="amber"
          sub="Según unidades filtradas"
        />
        <KpiCard
          label="Total de pedidos"
          value={kpisFiltrados.totalPedidos}
          icon={ShoppingBag}
          accent="blue"
          sub="Registros en el filtro actual"
        />
        <KpiCard
          label="Ventas totales"
          value={formatCurrency(kpisFiltrados.ventasTotales)}
          icon={Wallet}
          accent="green"
          sub="Neto tras descuentos"
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Flame size={18} className="text-amber-400" />
            Pedidos por horario (horas pico)
          </h3>
          {maxHora.pedidos > 0 && (
            <span className="badge bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Pico: {maxHora.hora} ({maxHora.pedidos} pedidos)
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={horasPico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="hora" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
              cursor={{ fill: 'rgba(59,130,246,0.08)' }}
            />
            <Bar dataKey="pedidos" radius={[6, 6, 0, 0]}>
              {horasPico.map((entry, idx) => (
                <Cell key={idx} fill={entry.hora === maxHora.hora ? '#f59e0b' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {horasPico.length === 0 && (
          <p className="text-center text-slate-500 py-6 text-sm">No hay datos para los filtros seleccionados.</p>
        )}
      </div>
    </div>
  )
}
