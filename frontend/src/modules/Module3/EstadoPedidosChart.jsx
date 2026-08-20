import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useData } from '../../context/DataContext.jsx'
import EstadoBadge from '../../components/UI/EstadoBadge.jsx'

const COLORS = {
  Pendiente: '#f59e0b',
  'En preparación': '#3b82f6',
  Entregado: '#10b981',
  Cancelado: '#ef4444',
}

export default function EstadoPedidosChart() {
  const { pedidosPorEstado } = useData()
  const total = pedidosPorEstado.reduce((acc, e) => acc + e.cantidad, 0)
  const data = pedidosPorEstado.filter((e) => e.cantidad > 0)

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-white mb-4">Distribución de pedidos por estado</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="cantidad"
            nameKey="estado"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.estado} fill={COLORS[entry.estado] || '#64748b'} stroke="#0f172a" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>

      <table className="w-full text-sm mt-2">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-800">
            <th className="py-2 font-medium">Estado</th>
            <th className="py-2 font-medium text-right">Cantidad</th>
            <th className="py-2 font-medium text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {pedidosPorEstado.map((e) => (
            <tr key={e.estado} className="border-b border-slate-800/60">
              <td className="py-2">
                <EstadoBadge estado={e.estado} />
              </td>
              <td className="py-2 text-right text-slate-300">{e.cantidad}</td>
              <td className="py-2 text-right text-slate-400">
                {total > 0 ? ((e.cantidad / total) * 100).toFixed(1) : '0.0'}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
