import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'resto_users'
const SESSION_KEY = 'resto_session'

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaurar sesión al cargar
  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY)
    if (session) {
      try {
        setUser(JSON.parse(session))
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    }
    // Seed de usuario demo si no existe ninguno
    const users = readUsers()
    if (users.length === 0) {
      writeUsers([
        {
          id: 'u-demo',
          nombre: 'Administrador',
          email: 'admin@resto.com',
          password: 'admin123',
          rol: 'admin',
        },
      ])
    }
    setLoading(false)
  }, [])

  const login = ({ email, password }) => {
    const users = readUsers()
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) {
      return { ok: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' }
    }
    const session = { id: found.id, nombre: found.nombre, email: found.email, rol: found.rol }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }

  const register = ({ nombre, email, password }) => {
    const users = readUsers()
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'Ya existe una cuenta registrada con ese correo.' }
    }
    const newUser = {
      id: `u-${Date.now()}`,
      nombre,
      email,
      password,
      rol: 'admin',
    }
    writeUsers([...users, newUser])
    const session = { id: newUser.id, nombre: newUser.nombre, email: newUser.email, rol: newUser.rol }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
