import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { ChefHat, Mail, Lock, User, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ nombre: '', email: 'admin@resto.com', password: 'admin123' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = mode === 'login' ? login(form) : register(form)
    if (!result.ok) setError(result.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <ChefHat className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">RestoGestión</h1>
          <p className="text-slate-400 text-sm mt-1">Pedidos, analítica e insights en tiempo real</p>
        </div>

        <div className="card p-6">
          <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-blue-500 text-white' : 'text-slate-400'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-blue-500 text-white' : 'text-slate-400'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-500" size={16} />
                  <input
                    name="nombre"
                    required
                    value={form.nombre}
                    onChange={handleChange}
                    className="input w-full pl-9"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="input w-full pl-9"
                  placeholder="correo@restaurante.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={4}
                  value={form.password}
                  onChange={handleChange}
                  className="input w-full pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full py-2.5">
              {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-5">
          
          </p>
        </div>
      </div>
    </div>
  )
}
