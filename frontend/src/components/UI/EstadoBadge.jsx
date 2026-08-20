const estilos = {
  Pendiente: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  'En preparación': 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  Entregado: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  Cancelado: 'bg-red-500/15 text-red-400 border border-red-500/30',
}

export default function EstadoBadge({ estado }) {
  return <span className={`badge ${estilos[estado] || 'bg-slate-700 text-slate-300'}`}>{estado}</span>
}
