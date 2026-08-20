import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const DataContext = createContext(null)

// En desarrollo, Vite redirige /api -> http://localhost:5000 (ver vite.config.js).
// Se puede sobreescribir con VITE_API_URL en un .env si el backend corre en otro host.
const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const ESTADOS = ['Pendiente', 'En preparación', 'Entregado', 'Cancelado']

// Columnas requeridas para la carga masiva (Excel / CSV)
export const COLUMNAS_REQUERIDAS = ['Fecha', 'Hora', 'Plato', 'Cantidad', 'Precio', 'Estado']

async function parseJsonSafe(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export function DataProvider({ children }) {
  const [pedidos, setPedidos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  const fetchPedidos = useCallback(async () => {
    const res = await fetch(`${API_BASE}/pedidos`)
    if (!res.ok) throw new Error(`El backend respondió con error (${res.status})`)
    return res.json()
  }, [])

  const refresh = useCallback(async () => {
    try {
      const data = await fetchPedidos()
      setPedidos(data)
      setConnectionError(null)
    } catch (err) {
      setConnectionError(
        err.message?.includes('fetch') || err.name === 'TypeError'
          ? 'No se pudo conectar con el backend Flask. Verifica que esté corriendo en localhost:5000 (python main.py).'
          : err.message
      )
    } finally {
      setLoaded(true)
    }
  }, [fetchPedidos])

  // Carga inicial desde la API al montar la app
  useEffect(() => {
    refresh()
  }, [refresh])

  // ---------- ACCIONES: todas mutan vía API REST, luego sincronizan el estado local ----------
  // Cualquier módulo que las invoque actualiza automáticamente KPIs, tablas y gráficos
  // porque todos consumen el mismo array `pedidos` vía useMemo derivados.

  const addPedido = useCallback(async (data) => {
    try {
      const res = await fetch(`${API_BASE}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await parseJsonSafe(res)
      if (!res.ok) throw new Error(body?.error || 'No se pudo registrar el pedido')
      setPedidos((prev) => [body, ...prev])
      setConnectionError(null)
      return { ok: true, pedido: body }
    } catch (err) {
      setConnectionError(err.message)
      return { ok: false, error: err.message }
    }
  }, [])

  const bulkImport = useCallback(
    async (rows) => {
      try {
        const res = await fetch(`${API_BASE}/pedidos/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows }),
        })
        const body = await parseJsonSafe(res)
        if (!res.ok && !body) throw new Error('No se pudo procesar la carga masiva')
        if (body?.imported > 0) {
          await refresh() // trae la lista completa ya actualizada desde el backend
        }
        setConnectionError(null)
        return body || { imported: 0, total: rows.length, errors: ['Respuesta vacía del servidor'] }
      } catch (err) {
        setConnectionError(err.message)
        return { imported: 0, total: rows.length, errors: [err.message] }
      }
    },
    [refresh]
  )

  const updatePedido = useCallback(async (id, changes) => {
    try {
      const res = await fetch(`${API_BASE}/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      const body = await parseJsonSafe(res)
      if (!res.ok) throw new Error(body?.error || 'No se pudo actualizar el pedido')
      setPedidos((prev) => prev.map((p) => (p.id === id ? body : p)))
      setConnectionError(null)
    } catch (err) {
      setConnectionError(err.message)
    }
  }, [])

  const deletePedido = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/pedidos/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error('No se pudo eliminar el pedido')
      setPedidos((prev) => prev.filter((p) => p.id !== id))
      setConnectionError(null)
    } catch (err) {
      setConnectionError(err.message)
    }
  }, [])

  // Aplicar descuento directo desde la Tabla Viva (Módulo 1)
  // type: 'pct' | 'monto'
  const applyDiscount = useCallback(async (id, type, value) => {
    try {
      const res = await fetch(`${API_BASE}/pedidos/${id}/descuento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value }),
      })
      const body = await parseJsonSafe(res)
      if (!res.ok) throw new Error(body?.error || 'No se pudo aplicar el descuento')
      setPedidos((prev) => prev.map((p) => (p.id === id ? body : p)))
      setConnectionError(null)
    } catch (err) {
      setConnectionError(err.message)
    }
  }, [])

  const changeEstado = useCallback(async (id, estado) => {
    try {
      const res = await fetch(`${API_BASE}/pedidos/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      const body = await parseJsonSafe(res)
      if (!res.ok) throw new Error(body?.error || 'No se pudo cambiar el estado')
      setPedidos((prev) => prev.map((p) => (p.id === id ? body : p)))
      setConnectionError(null)
    } catch (err) {
      setConnectionError(err.message)
    }
  }, [])

  const clearAll = useCallback(async () => {
    try {
      await Promise.all(pedidos.map((p) => fetch(`${API_BASE}/pedidos/${p.id}`, { method: 'DELETE' })))
      setPedidos([])
      setConnectionError(null)
    } catch (err) {
      setConnectionError(err.message)
    }
  }, [pedidos])

  // ---------- DERIVADOS: recalculados automáticamente en cada render cuando `pedidos` cambia ----------
  // El backend ya devuelve bruto/descuentoAplicado/total calculados (ver row_to_dict en db.py),
  // así que `pedidos` ya viene con totales listos para consumir directamente.

  const kpis = useMemo(() => {
    const totalPedidos = pedidos.length
    const ventasTotales = pedidos.reduce((acc, p) => acc + p.total, 0)
    const descuentosTotales = pedidos.reduce((acc, p) => acc + p.descuentoAplicado, 0)

    const conteoPorPlato = {}
    pedidos.forEach((p) => {
      conteoPorPlato[p.plato] = (conteoPorPlato[p.plato] || 0) + p.cantidad
    })
    const platoMasVendido = Object.entries(conteoPorPlato).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    const ticketPromedio = totalPedidos > 0 ? ventasTotales / totalPedidos : 0

    return {
      totalPedidos,
      ventasTotales,
      descuentosTotales,
      platoMasVendido,
      ticketPromedio,
    }
  }, [pedidos])

  const pedidosPorHora = useMemo(() => {
    const buckets = {}
    pedidos.forEach((p) => {
      const h = (p.hora || '00:00').split(':')[0] + ':00'
      buckets[h] = (buckets[h] || 0) + 1
    })
    return Object.entries(buckets)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hora, pedidos]) => ({ hora, pedidos }))
  }, [pedidos])

  const ventasPorDia = useMemo(() => {
    const buckets = {}
    pedidos.forEach((p) => {
      if (!buckets[p.fecha]) buckets[p.fecha] = { fecha: p.fecha, ventas: 0, descuentos: 0, bruto: 0 }
      buckets[p.fecha].ventas += p.total
      buckets[p.fecha].descuentos += p.descuentoAplicado
      buckets[p.fecha].bruto += p.bruto
    })
    return Object.values(buckets).sort((a, b) => a.fecha.localeCompare(b.fecha))
  }, [pedidos])

  const pedidosPorEstado = useMemo(() => {
    const buckets = {}
    ESTADOS.forEach((e) => (buckets[e] = 0))
    pedidos.forEach((p) => {
      buckets[p.estado] = (buckets[p.estado] || 0) + 1
    })
    return Object.entries(buckets).map(([estado, cantidad]) => ({ estado, cantidad }))
  }, [pedidos])

  const participacionPlatos = useMemo(() => {
    const buckets = {}
    let totalUnidades = 0
    pedidos.forEach((p) => {
      buckets[p.plato] = (buckets[p.plato] || 0) + p.cantidad
      totalUnidades += p.cantidad
    })
    return Object.entries(buckets)
      .map(([plato, unidades]) => ({
        plato,
        unidades,
        porcentaje: totalUnidades > 0 ? (unidades / totalUnidades) * 100 : 0,
      }))
      .sort((a, b) => b.unidades - a.unidades)
  }, [pedidos])

  // Insights automáticos consumidos por el Módulo 3
  const insights = useMemo(() => {
    if (participacionPlatos.length === 0) {
      return { estrella: null, bajaRotacion: null, horaCritica: null, ticketPromedio: 0 }
    }
    const estrella = participacionPlatos[0]
    const bajaRotacion = participacionPlatos[participacionPlatos.length - 1]
    const horaCritica = [...pedidosPorHora].sort((a, b) => b.pedidos - a.pedidos)[0] || null

    return {
      estrella,
      bajaRotacion,
      horaCritica,
      ticketPromedio: kpis.ticketPromedio,
    }
  }, [participacionPlatos, pedidosPorHora, kpis])

  const value = {
    pedidos,
    loaded,
    connectionError,
    refresh,
    addPedido,
    bulkImport,
    updatePedido,
    deletePedido,
    applyDiscount,
    changeEstado,
    clearAll,
    kpis,
    pedidosPorHora,
    ventasPorDia,
    pedidosPorEstado,
    participacionPlatos,
    insights,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData debe usarse dentro de DataProvider')
  return ctx
}
