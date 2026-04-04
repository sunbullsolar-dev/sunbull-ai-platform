import { Routes, Route } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import Proposals from './pages/Proposals'
import Deals from './pages/Deals'
import DealDetail from './pages/DealDetail'
import Installers from './pages/Installers'
import InstallerDetail from './pages/InstallerDetail'
import Tenants from './pages/Tenants'
import TenantDetail from './pages/TenantDetail'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="/installers" element={<Installers />} />
        <Route path="/installers/:id" element={<InstallerDetail />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/tenants/:id" element={<TenantDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </AdminLayout>
  )
}

export default App
