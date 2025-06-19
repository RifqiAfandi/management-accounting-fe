import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3,
  PieChart
} from 'lucide-react';
import { akunAPI, jurnalUmumAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAkun: 0,
    totalTransaksi: 0,
    totalDebet: 0,
    totalKredit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch accounts
      const akunResponse = await akunAPI.getAll();
      const totalAkun = akunResponse.data?.length || 0;

      // Fetch journal entries
      const jurnalResponse = await jurnalUmumAPI.getAll();
      const jurnalData = jurnalResponse.data || [];
      
      const totalTransaksi = jurnalData.length;
      const totalDebet = jurnalData.reduce((sum, item) => sum + (parseFloat(item.debet) || 0), 0);
      const totalKredit = jurnalData.reduce((sum, item) => sum + (parseFloat(item.kredit) || 0), 0);

      setStats({
        totalAkun,
        totalTransaksi,
        totalDebet,
        totalKredit
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              {loading ? '...' : value}
            </span>
            {trend && (
              <div className={`ml-2 flex items-center text-sm ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="ml-1">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Ringkasan sistem akuntansi manajemen
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Akun"
          value={stats.totalAkun}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Transaksi"
          value={stats.totalTransaksi}
          icon={BarChart3}
          color="bg-green-500"
        />
        <StatCard
          title="Total Debet"
          value={formatCurrency(stats.totalDebet)}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Kredit"
          value={formatCurrency(stats.totalKredit)}
          icon={TrendingDown}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Aksi Cepat
          </h3>
          <div className="space-y-3">
            <button className="w-full btn-primary justify-start">
              <DollarSign className="h-5 w-5 mr-2" />
              Tambah Transaksi Baru
            </button>
            <button className="w-full btn-secondary justify-start">
              <BarChart3 className="h-5 w-5 mr-2" />
              Lihat Laporan Keuangan
            </button>
            <button className="w-full btn-secondary justify-start">
              <PieChart className="h-5 w-5 mr-2" />
              Analisis Neraca Saldo
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status Sistem
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Neraca Saldo</span>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  Math.abs(stats.totalDebet - stats.totalKredit) < 1000 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {Math.abs(stats.totalDebet - stats.totalKredit) < 1000 ? 'Seimbang' : 'Tidak Seimbang'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm font-medium">Terhubung</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sinkronisasi</span>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm font-medium">Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Aktivitas Terbaru
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada aktivitas terbaru</p>
          <p className="text-sm">Mulai dengan menambahkan transaksi atau akun baru</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
