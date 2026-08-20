import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useData } from '../../context/DataContext.jsx'
import { formatCurrency, formatDate } from '../../utils/format.js'

export default function VentasDiariasChart() {
  const { ventasPorDia } = useData()
  const data = ventasPorDia.map((d) => ({ ...d, fechaCorta: formatDate(d.fecha) }))

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-white mb-4">Ventas diarias (S/) e impacto de descuentos</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="fechaCorta" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="ventas" name="Ventas netas" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="descuentos" name="Descuentos aplicados" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto mt-4 -mx-5">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-800">
              <th className="px-5 py-2 font-medium">Fecha</th>
              <th className="px-2 py-2 font-medium text-right">Bruto</th>
              <th className="px-2 py-2 font-medium text-right">Descuentos</th>
              <th className="px-5 py-2 font-medium text-right">Neto</th>
            </tr>
          </thead>
          <tbody>
            {ventasPorDia.map((d) => (
              <tr key={d.fecha} className="border-b border-slate-800/60">
                <td className="px-5 py-2 text-slate-300">{d.fecha}</td>
                <td className="px-2 py-2 text-right text-slate-400">{formatCurrency(d.bruto)}</td>
                <td className="px-2 py-2 text-right text-amber-400">{formatCurrency(d.descuentos)}</td>
                <td className="px-5 py-2 text-right font-semibold text-emerald-400">{formatCurrency(d.ventas)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
