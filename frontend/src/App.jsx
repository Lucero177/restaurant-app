import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import Login from './components/Auth/Login.jsx'
import AppLayout from './components/Layout/AppLayout.jsx'
import GestionPedidos from './modules/Module1/GestionPedidos.jsx'
import DashboardOperativo from './modules/Module2/DashboardOperativo.jsx'
import Reportes from './modules/Module3/Reportes.jsx'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DataProvider>
              <AppLayout />
            </DataProvider>
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/pedidos" replace />} />
        <Route path="pedidos" element={<GestionPedidos />} />
        <Route path="dashboard" element={<DashboardOperativo />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
