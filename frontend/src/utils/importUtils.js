import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { COLUMNAS_REQUERIDAS, ESTADOS } from '../context/DataContext.jsx'

function normalizeRow(row) {
  // Normaliza claves (por si el excel trae "fecha" en minúscula, espacios, etc.)
  const map = {}
  Object.keys(row).forEach((key) => {
    const clean = key.trim().toLowerCase()
    map[clean] = row[key]
  })
  return {
    Fecha: map['fecha'],
    Hora: map['hora'],
    Plato: map['plato'],
    Cantidad: map['cantidad'],
    Precio: map['precio'],
    Estado: map['estado'],
  }
}

function normalizeFecha(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'number') {
    // Fecha serial de Excel
    const date = XLSX.SSF.parse_date_code(value)
    if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
  }
  const str = String(value).trim()
  // admite dd/mm/yyyy o yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  const parts = str.split(/[/-]/)
  if (parts.length === 3) {
    const [d, m, y] = parts
    if (y && y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return str
}

function normalizeHora(value) {
  if (typeof value === 'number') {
    // Hora fraccional de Excel (0-1)
    const totalMinutes = Math.round(value * 24 * 60)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  return String(value).trim().slice(0, 5)
}

/**
 * Valida y normaliza filas provenientes de Excel/CSV.
 * Retorna { validRows, errors } donde errors describe filas rechazadas.
 */
export function validateRows(rawRows) {
  const errors = []
  const validRows = []

  rawRows.forEach((raw, idx) => {
    const row = normalizeRow(raw)
    const lineNum = idx + 2 // +2 asumiendo fila 1 = encabezado

    const missing = COLUMNAS_REQUERIDAS.filter(
      (col) => row[col] === undefined || row[col] === null || row[col] === ''
    )
    if (missing.length > 0) {
      errors.push(`Fila ${lineNum}: faltan columnas (${missing.join(', ')})`)
      return
    }

    const cantidad = Number(row.Cantidad)
    const precio = Number(row.Precio)

    if (Number.isNaN(cantidad) || cantidad <= 0) {
      errors.push(`Fila ${lineNum}: "Cantidad" inválida (${row.Cantidad})`)
      return
    }
    if (Number.isNaN(precio) || precio < 0) {
      errors.push(`Fila ${lineNum}: "Precio" inválido (${row.Precio})`)
      return
    }

    const estado = ESTADOS.includes(String(row.Estado).trim())
      ? String(row.Estado).trim()
      : 'Pendiente'

    validRows.push({
      Fecha: normalizeFecha(row.Fecha),
      Hora: normalizeHora(row.Hora),
      Plato: String(row.Plato).trim(),
      Cantidad: cantidad,
      Precio: precio,
      Estado: estado,
    })
  })

  return { validRows, errors }
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary', cellDates: false })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        resolve(json)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsBinaryString(file)
  })
}

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    })
  })
}

export async function parseImportedFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'csv') return parseCsvFile(file)
  if (ext === 'xlsx' || ext === 'xls') return parseExcelFile(file)
  throw new Error('Formato no soportado. Usa .xlsx o .csv')
}
