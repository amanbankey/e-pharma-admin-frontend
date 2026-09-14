import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Shell from './components/Shell'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import UpdatePassword from './pages/UpdatePassword'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Category from './pages/Category'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Customers from './pages/Customers'
import Admins from './pages/Admins'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/update-password/:token" element={<UpdatePassword />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Shell>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ProtectedRoute permission="products"><Products /></ProtectedRoute>} />
                <Route path="/category" element={<ProtectedRoute permission="products"><Category /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute permission="inventory"><Inventory /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute permission="orders"><Orders /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute permission="reports"><Reports /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute permission="users"><Customers /></ProtectedRoute>} />
                <Route path="/admins" element={<ProtectedRoute permission="admins"><Admins /></ProtectedRoute>} />
              </Routes>
            </Shell>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
