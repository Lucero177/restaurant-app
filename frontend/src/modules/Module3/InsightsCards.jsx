import { useData } from '../../context/DataContext.jsx'
import { formatCurrency } from '../../utils/format.js'
import { Star, TrendingDown, AlarmClock, Receipt } from 'lucide-react'

export default function InsightsCards() {
  const { insights } = useData()
  const { estrella, bajaRotacion, horaCritica, ticketPromedio } = insights

  const cards = [
    {
      icon: Star,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      title: 'Plato estrella',
      value: estrella ? estrella.plato : '—',
      detail: estrella ? `${estrella.unidades} unidades · ${estrella.porcentaje.toFixed(1)}% de participación` : 'Sin datos suficientes',
    },
    {
      icon: TrendingDown,
      accent: 'text-red-400 bg-red-500/10 border-red-500/20',
      title: 'Baja rotación',
      value: bajaRotacion ? bajaRotacion.plato : '—',
      detail: bajaRotacion
        ? `Solo ${bajaRotacion.unidades} unidades vendidas. Considera revisar receta o promoción.`
        : 'Sin datos suficientes',
    },
    {
      icon: AlarmClock,
      accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      title: 'Hora crítica de personal',
      value: horaCritica ? horaCritica.hora : '—',
      detail: horaCritica
        ? `${horaCritica.pedidos} pedidos concentrados. Refuerza personal en este horario.`
        : 'Sin datos suficientes',
    },
    {
      icon: Receipt,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'Ticket promedio',
      value: formatCurrency(ticketPromedio),
      detail: 'Calculado sobre el total de pedidos netos tras descuentos.',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.title} className={`card p-5 border ${c.accent.split(' ').pop()}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${c.accent}`}>
            <c.icon size={18} />
          </div>
          <p className="text-xs font-medium text-slate-400 mb-1">{c.title}</p>
          <p className="text-lg font-bold text-white mb-1 truncate">{c.value}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{c.detail}</p>
        </div>
      ))}
    </div>
  )
}
