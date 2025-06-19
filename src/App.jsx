import React, { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import AkunManagement from './components/AkunManagement'
import BuktiTransaksi from './components/BuktiTransaksi'
import JurnalUmum from './components/JurnalUmum'
import Laporan from './components/Laporan'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'akun':
        return <AkunManagement />
      case 'bukti-transaksi':
        return <BuktiTransaksi />
      case 'jurnal-umum':
        return <JurnalUmum />
      case 'jurnal-penyesuaian':
        return <div className="card p-8 text-center text-gray-500 dark:text-gray-400">Jurnal Penyesuaian - Coming Soon</div>
      case 'laporan':
        return <Laporan />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  )
}

export default App
