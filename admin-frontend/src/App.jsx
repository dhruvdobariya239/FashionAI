import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAuth } from './ui/RequireAuth.jsx'
import { AdminLayout } from './ui/layout/AdminLayout.jsx'
import { LoginPage } from './ui/pages/LoginPage.jsx'
import { DashboardPage } from './ui/pages/DashboardPage.jsx'
import { ProductsPage } from './ui/pages/ProductsPage.jsx'
import { ProductCreatePage } from './ui/pages/ProductCreatePage.jsx'
import { ProductEditPage } from './ui/pages/ProductEditPage.jsx'
import { CategoriesPage } from './ui/pages/CategoriesPage.jsx'
import { OrdersPage } from './ui/pages/OrdersPage.jsx'
import { EmailsPage } from './ui/pages/EmailsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductCreatePage />} />
        <Route path="products/:id" element={<ProductEditPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="emails" element={<EmailsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
