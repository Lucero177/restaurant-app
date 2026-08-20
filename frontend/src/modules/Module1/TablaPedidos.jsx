import { useMemo, useState } from 'react'
import { useData, ESTADOS } from '../../context/DataContext.jsx'
import EstadoBadge from '../../components/UI/EstadoBadge.jsx'
import Modal from '../../components/UI/Modal.jsx'
import { formatCurrency } from '../../utils/format.js'
import { Search, Percent, Pencil, Trash2, ChevronLeft, ChevronRight, Tag } from 'lucide-react'

const PAGE_SIZE = 8

export default function TablaPedidos() {
  const { pedidos, applyDiscount, updatePedido, changeEstado, deletePedido } = useData()
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [page, setPage] = useState(1)

  const [discountTarget, setDiscountTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)

  const filtered = useMemo(() => {
    return pedidos.filter((p) => {
      const matchesSearch =
        !search ||
        p.plato.toLowerCase().includes(search.toLowerCase()) ||
        p.fecha.includes(search)
      const matchesEstado = filtroEstado === 'Todos' || p.estado === filtroEstado
      return matchesSearch && matchesEstado
    })
  }, [pedidos, search, filtroEstado])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goToPage = (p) => setPage(Math.min(Math.max(p, 1), totalPages))

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-white">Tabla viva de pedidos ({filtered.length})</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar plato o fecha..."
              className="input pl-9 w-full sm:w-56"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value)
              setPage(1)
            }}
            className="input"
          >
            <option value="Todos">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-800">
              <th className="px-5 py-2 font-medium">Fecha / Hora</th>
              <th className="px-2 py-2 font-medium">Plato</th>
              <th className="px-2 py-2 font-medium text-center">Cant.</th>
              <th className="px-2 py-2 font-medium text-right">P. Unit.</th>
              <th className="px-2 py-2 font-medium text-right">Descuento</th>
              <th className="px-2 py-2 font-medium text-right">Total</th>
              <th className="px-2 py-2 font-medium">Estado</th>
              <th className="px-5 py-2 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((p) => (
              <tr key={p.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                <td className="px-5 py-2.5 whitespace-nowrap text-slate-300">
                  {p.fecha} <span className="text-slate-500">· {p.hora}</span>
                </td>
                <td className="px-2 py-2.5 text-slate-200 font-medium">{p.plato}</td>
                <td className="px-2 py-2.5 text-center text-slate-300">{p.cantidad}</td>
                <td className="px-2 py-2.5 text-right text-slate-300">{formatCurrency(p.precioUnitario)}</td>
                <td className="px-2 py-2.5 text-right text-amber-400">
                  {p.descuentoAplicado > 0 ? `- ${formatCurrency(p.descuentoAplicado)}` : '—'}
                </td>
                <td className="px-2 py-2.5 text-right font-semibold text-emerald-400">
                  {formatCurrency(p.total)}
                </td>
                <td className="px-2 py-2.5">
                  <select
                    value={p.estado}
                    onChange={(e) => changeEstado(p.id, e.target.value)}
                    className="bg-transparent text-xs border-none focus:ring-0 cursor-pointer"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e} className="bg-slate-800">
                        {e}
                      </option>
                    ))}
                  </select>
                  <EstadoBadge estado={p.estado} />
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <button
                      title="Aplicar descuento"
                      onClick={() => setDiscountTarget(p)}
                      className="p-1.5 rounded-md text-amber-400 hover:bg-amber-500/10"
                    >
                      <Percent size={15} />
                    </button>
                    <button
                      title="Editar precio/cantidad"
                      onClick={() => setEditTarget(p)}
                      className="p-1.5 rounded-md text-blue-400 hover:bg-blue-500/10"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      title="Eliminar"
                      onClick={() => deletePedido(p.id)}
                      className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-slate-500 py-8">
                  No se encontraron pedidos con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-slate-500">
          Página {page} de {totalPages}
        </p>
        <div className="flex gap-1">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="btn btn-secondary px-2 py-1.5">
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="btn btn-secondary px-2 py-1.5"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Modal Descuento */}
      <Modal open={!!discountTarget} onClose={() => setDiscountTarget(null)} title="Aplicar descuento" maxWidth="max-w-sm">
        {discountTarget && (
          <DiscountForm
            pedido={discountTarget}
            onApply={(type, value) => {
              applyDiscount(discountTarget.id, type, value)
              setDiscountTarget(null)
            }}
          />
        )}
      </Modal>

      {/* Modal Edición */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar pedido" maxWidth="max-w-sm">
        {editTarget && (
          <EditForm
            pedido={editTarget}
            onSave={(changes) => {
              updatePedido(editTarget.id, changes)
              setEditTarget(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

function DiscountForm({ pedido, onApply }) {
  const [type, setType] = useState('pct')
  const [value, setValue] = useState(pedido.descuentoPct || pedido.descuentoMonto || 0)

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        <span className="text-slate-200 font-medium">{pedido.plato}</span> · Total actual:{' '}
        <span className="text-emerald-400">{formatCurrency(pedido.total)}</span>
      </p>
      <div className="flex bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setType('pct')}
          className={`flex-1 py-1.5 rounded-md text-sm ${type === 'pct' ? 'bg-amber-500 text-slate-900 font-medium' : 'text-slate-400'}`}
        >
          Porcentaje (%)
        </button>
        <button
          onClick={() => setType('monto')}
          className={`flex-1 py-1.5 rounded-md text-sm ${type === 'monto' ? 'bg-amber-500 text-slate-900 font-medium' : 'text-slate-400'}`}
        >
          Monto (S/)
        </button>
      </div>
      <div className="relative">
        <Tag className="absolute left-3 top-2.5 text-slate-500" size={15} />
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input w-full pl-9"
        />
      </div>
      <button onClick={() => onApply(type, value)} className="btn btn-warning w-full">
        Aplicar descuento
      </button>
    </div>
  )
}

function EditForm({ pedido, onSave }) {
  const [cantidad, setCantidad] = useState(pedido.cantidad)
  const [precioUnitario, setPrecioUnitario] = useState(pedido.precioUnitario)

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1 block">Cantidad</label>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          className="input w-full"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1 block">Precio unitario (S/)</label>
        <input
          type="number"
          min="0"
          step="0.10"
          value={precioUnitario}
          onChange={(e) => setPrecioUnitario(e.target.value)}
          className="input w-full"
        />
      </div>
      <button
        onClick={() => onSave({ cantidad: Number(cantidad), precioUnitario: Number(precioUnitario) })}
        className="btn btn-primary w-full"
      >
        Guardar cambios
      </button>
    </div>
  )
}
