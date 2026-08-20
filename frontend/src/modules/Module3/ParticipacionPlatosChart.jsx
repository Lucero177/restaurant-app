import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '../../context/DataContext.jsx'

export default function ParticipacionPlatosChart() {
  const { participacionPlatos } = useData()
  const data = participacionPlatos.slice(0, 8).map((p) => ({ ...p, porcentaje: Number(p.porcentaje.toFixed(1)) }))

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-white mb-4">Participación de platos (% de unidades vendidas)</h3>
      <ResponsiveContainer width="100%" height={Math.max(260, data.length * 38)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={12} unit="%" />
          <YAxis dataKey="plato" type="category" stroke="#64748b" fontSize={12} width={110} />
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
            cursor={{ fill: 'rgba(59,130,246,0.08)' }}
          />
          <Bar dataKey="porcentaje" fill="#3b82f6" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <table className="w-full text-sm mt-4">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-800">
            <th className="py-2 font-medium">Plato</th>
            <th className="py-2 font-medium text-right">Unidades</th>
            <th className="py-2 font-medium text-right">Participación</th>
          </tr>
        </thead>
        <tbody>
          {participacionPlatos.map((p) => (
            <tr key={p.plato} className="border-b border-slate-800/60">
              <td className="py-2 text-slate-300">{p.plato}</td>
              <td className="py-2 text-right text-slate-300">{p.unidades}</td>
              <td className="py-2 text-right text-blue-400 font-medium">{p.porcentaje.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
