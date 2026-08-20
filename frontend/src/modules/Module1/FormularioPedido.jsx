import { useState } from 'react'
import Modal from '../../components/UI/Modal.jsx'
import { useData, ESTADOS } from '../../context/DataContext.jsx'
import { PlusCircle, AlertCircle, Loader2 } from 'lucide-react'

const emptyForm = {
  fecha: new Date().toISOString().slice(0, 10),
  hora: new Date().toTimeString().slice(0, 5),
  plato: '',
  cantidad: 1,
  precioUnitario: '',
  estado: 'Pendiente',
}

export default function FormularioPedido() {
  const { addPedido } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.plato.trim() || !form.precioUnitario) return
    setSaving(true)
    setError('')
    // Se envía al backend; al confirmarse, se refleja al instante en tabla, dashboard y reportes
    const result = await addPedido(form)
    setSaving(false)
    if (!result.ok) {
      setError(result.error || 'No se pudo guardar el pedido')
      return
    }
    setForm(emptyForm)
    setOpen(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary">
        <PlusCircle size={16} />
        Nuevo pedido
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar pedido manualmente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Fecha</label>
              <input
                type="date"
                name="fecha"
                required
                value={form.fecha}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Hora</label>
              <input
                type="time"
                name="hora"
                required
                value={form.hora}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Plato</label>
            <input
              type="text"
              name="plato"
              required
              placeholder="Ej: Lomo Saltado"
              value={form.plato}
              onChange={handleChange}
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                min="1"
                required
                value={form.cantidad}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Precio unitario (S/)</label>
              <input
                type="number"
                name="precioUnitario"
                min="0"
                step="0.10"
                required
                placeholder="0.00"
                value={form.precioUnitario}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className="input w-full">
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary" disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Guardando...' : 'Guardar pedido'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
