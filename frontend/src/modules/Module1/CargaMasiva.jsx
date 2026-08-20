import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import { parseImportedFile, validateRows } from '../../utils/importUtils.js'
import { COLUMNAS_REQUERIDAS } from '../../context/DataContext.jsx'

export default function CargaMasiva() {
  const { bulkImport } = useData()
  const [status, setStatus] = useState('idle') // idle | parsing | done | error
  const [result, setResult] = useState(null) // { imported, errors }
  const [fileName, setFileName] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return
      setFileName(file.name)
      setStatus('parsing')
      setResult(null)
      try {
        const rawRows = await parseImportedFile(file)
        // 1) Validación/normalización local (formatos de fecha, columnas faltantes, etc.)
        const { validRows, errors: localErrors } = validateRows(rawRows)

        if (validRows.length === 0) {
          setResult({ imported: 0, total: rawRows.length, errors: localErrors })
          setStatus('error')
          return
        }

        // 2) Envío al backend Flask, que persiste en SQLite y actualiza el estado global
        const backendResult = await bulkImport(validRows)
        const allErrors = [...localErrors, ...(backendResult.errors || [])]

        setResult({
          imported: backendResult.imported ?? 0,
          total: rawRows.length,
          errors: allErrors,
        })
        setStatus(backendResult.imported > 0 ? 'done' : 'error')
      } catch (err) {
        setResult({ imported: 0, total: 0, errors: [err.message || 'Error al procesar el archivo'] })
        setStatus('error')
      }
    },
    [bulkImport]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  })

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
        <FileSpreadsheet size={18} className="text-blue-400" />
        Carga masiva de pedidos
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Columnas requeridas: <span className="text-slate-400">{COLUMNAS_REQUERIDAS.join(', ')}</span>
      </p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto mb-3 text-slate-500" size={32} />
        {isDragActive ? (
          <p className="text-sm text-blue-400">Suelta el archivo aquí...</p>
        ) : (
          <>
            <p className="text-sm text-slate-300">Arrastra tu archivo Excel/CSV aquí o haz clic para buscarlo</p>
            <p className="text-xs text-slate-500 mt-1">.xlsx, .xls, .csv</p>
          </>
        )}
      </div>

      {status === 'parsing' && (
        <p className="text-sm text-amber-400 mt-4 animate-pulse">Procesando "{fileName}"...</p>
      )}

      {result && status !== 'parsing' && (
        <div className="mt-4 space-y-2">
          {result.imported > 0 && (
            <div className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>
                Se importaron <strong>{result.imported}</strong> de {result.total} registros desde "{fileName}".
                El dashboard y los reportes ya fueron actualizados.
              </span>
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium mb-1">{result.errors.length} fila(s) con errores:</p>
                <ul className="text-xs space-y-0.5 max-h-28 overflow-y-auto list-disc list-inside">
                  {result.errors.slice(0, 15).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
