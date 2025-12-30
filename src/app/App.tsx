import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { TopBar } from '../components/TopBar'
import { CategoriesPage } from '../features/categories/CategoriesPage'
import { ExpensesPage } from '../features/expenses/ExpensesPage'
import { OverviewPage } from '../features/overview/OverviewPage'

export function App() {
  return (
    <HashRouter>
      <div className="appRoot">
        <div className="container">
          <TopBar />
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  )
}


