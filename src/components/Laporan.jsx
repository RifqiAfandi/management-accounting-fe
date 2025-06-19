import React, { useState, useEffect } from 'react';
import { FileText, Download, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { jurnalUmumAPI, akunAPI } from '../services/api';

const Laporan = () => {
  const [data, setData] = useState({
    akuns: [],
    jurnals: []
  });
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('neraca-saldo');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [akunResponse, jurnalResponse] = await Promise.all([
        akunAPI.getAll(),
        jurnalUmumAPI.getAll()
      ]);
      setData({
        akuns: akunResponse.data || [],
        jurnals: jurnalResponse.data || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNeracaSaldo = () => {
    const akunSaldo = {};
    
    // Initialize all accounts with zero balance
    data.akuns.forEach(akun => {
      akunSaldo[akun.nomor_akun] = {
        nama_akun: akun.nama_akun,
        kelompok_akun: akun.kelompok_akun,
        posisi_saldo_normal: akun.posisi_saldo_normal,
        debet: 0,
        kredit: 0,
        saldo: 0
      };
    });

    // Calculate balances from journal entries
    data.jurnals.forEach(jurnal => {
      if (akunSaldo[jurnal.no_akun]) {
        akunSaldo[jurnal.no_akun].debet += parseFloat(jurnal.debet) || 0;
        akunSaldo[jurnal.no_akun].kredit += parseFloat(jurnal.kredit) || 0;
      }
    });

    // Calculate final balance based on normal balance position
    Object.keys(akunSaldo).forEach(nomorAkun => {
      const akun = akunSaldo[nomorAkun];
      if (akun.posisi_saldo_normal === 'Debet') {
        akun.saldo = akun.debet - akun.kredit;
      } else {
        akun.saldo = akun.kredit - akun.debet;
      }
    });

    return akunSaldo;
  };

  const generateLabaRugi = () => {
    const neracaSaldo = calculateNeracaSaldo();
    const pendapatan = [];
    const beban = [];

    Object.entries(neracaSaldo).forEach(([nomorAkun, akun]) => {
      if (akun.kelompok_akun === 'Pendapatan' && akun.saldo > 0) {
        pendapatan.push({ nomor_akun: nomorAkun, ...akun });
      }
      if (akun.kelompok_akun === 'Beban' && akun.saldo > 0) {
        beban.push({ nomor_akun: nomorAkun, ...akun });
      }
    });

    const totalPendapatan = pendapatan.reduce((sum, item) => sum + item.saldo, 0);
    const totalBeban = beban.reduce((sum, item) => sum + item.saldo, 0);
    const labaRugi = totalPendapatan - totalBeban;

    return { pendapatan, beban, totalPendapatan, totalBeban, labaRugi };
  };

  const generateNeraca = () => {
    const neracaSaldo = calculateNeracaSaldo();
    const aset = [];
    const liabilitas = [];
    const ekuitas = [];

    Object.entries(neracaSaldo).forEach(([nomorAkun, akun]) => {
      if ((akun.kelompok_akun === 'Aset Lancar' || akun.kelompok_akun === 'Aset Tetap') && akun.saldo > 0) {
        aset.push({ nomor_akun: nomorAkun, ...akun });
      }
      if ((akun.kelompok_akun === 'Liabilitas Jangka Pendek' || akun.kelompok_akun === 'Liabilitas Jangka Panjang') && akun.saldo > 0) {
        liabilitas.push({ nomor_akun: nomorAkun, ...akun });
      }
      if (akun.kelompok_akun === 'Ekuitas' && akun.saldo > 0) {
        ekuitas.push({ nomor_akun: nomorAkun, ...akun });
      }
    });

    const totalAset = aset.reduce((sum, item) => sum + item.saldo, 0);
    const totalLiabilitas = liabilitas.reduce((sum, item) => sum + item.saldo, 0);
    const totalEkuitas = ekuitas.reduce((sum, item) => sum + item.saldo, 0);

    // Add net income to equity
    const { labaRugi } = generateLabaRugi();
    const totalEkuitasWithProfit = totalEkuitas + labaRugi;

    return { aset, liabilitas, ekuitas, totalAset, totalLiabilitas, totalEkuitas: totalEkuitasWithProfit, labaRugi };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount || 0);
  };

  const reports = [
    { id: 'neraca-saldo', name: 'Neraca Saldo', icon: BarChart3 },
    { id: 'laba-rugi', name: 'Laporan Laba Rugi', icon: TrendingUp },
    { id: 'neraca', name: 'Neraca', icon: PieChart },
  ];

  const renderNeracaSaldo = () => {
    const neracaSaldo = calculateNeracaSaldo();
    const totalDebet = Object.values(neracaSaldo).reduce((sum, akun) => sum + akun.debet, 0);
    const totalKredit = Object.values(neracaSaldo).reduce((sum, akun) => sum + akun.kredit, 0);

    return (
      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Neraca Saldo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead className="bg-gray-50 dark:bg-dark-800">
              <tr>
                <th className="table-header">No Akun</th>
                <th className="table-header">Nama Akun</th>
                <th className="table-header">Kelompok</th>
                <th className="table-header">Debet</th>
                <th className="table-header">Kredit</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {Object.entries(neracaSaldo).map(([nomorAkun, akun]) => (
                <tr key={nomorAkun} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="table-cell font-medium">{nomorAkun}</td>
                  <td className="table-cell">{akun.nama_akun}</td>
                  <td className="table-cell">{akun.kelompok_akun}</td>
                  <td className="table-cell text-right">{formatCurrency(akun.debet)}</td>
                  <td className="table-cell text-right">{formatCurrency(akun.kredit)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 dark:bg-dark-700 font-semibold">
                <td colSpan="3" className="table-cell">TOTAL</td>
                <td className="table-cell text-right">{formatCurrency(totalDebet)}</td>
                <td className="table-cell text-right">{formatCurrency(totalKredit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLabaRugi = () => {
    const { pendapatan, beban, totalPendapatan, totalBeban, labaRugi } = generateLabaRugi();

    return (
      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Laporan Laba Rugi</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Periode: {new Date().getFullYear()}</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Pendapatan */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">PENDAPATAN</h4>
            {pendapatan.length > 0 ? (
              <div className="space-y-2">
                {pendapatan.map(item => (
                  <div key={item.nomor_akun} className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{item.nama_akun}</span>
                    <span className="font-medium">{formatCurrency(item.saldo)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-dark-600 pt-2 flex justify-between font-semibold">
                  <span>Total Pendapatan</span>
                  <span className="text-green-600 dark:text-green-400">{formatCurrency(totalPendapatan)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Tidak ada pendapatan</p>
            )}
          </div>

          {/* Beban */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">BEBAN</h4>
            {beban.length > 0 ? (
              <div className="space-y-2">
                {beban.map(item => (
                  <div key={item.nomor_akun} className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{item.nama_akun}</span>
                    <span className="font-medium">{formatCurrency(item.saldo)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-dark-600 pt-2 flex justify-between font-semibold">
                  <span>Total Beban</span>
                  <span className="text-red-600 dark:text-red-400">{formatCurrency(totalBeban)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Tidak ada beban</p>
            )}
          </div>

          {/* Laba/Rugi */}
          <div className="border-t border-gray-300 dark:border-dark-600 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>{labaRugi >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}</span>
              <span className={labaRugi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {formatCurrency(Math.abs(labaRugi))}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNeraca = () => {
    const { aset, liabilitas, ekuitas, totalAset, totalLiabilitas, totalEkuitas, labaRugi } = generateNeraca();

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ASET</h3>
          </div>
          <div className="p-6 space-y-4">
            {aset.length > 0 ? (
              <div className="space-y-2">
                {aset.map(item => (
                  <div key={item.nomor_akun} className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{item.nama_akun}</span>
                    <span className="font-medium">{formatCurrency(item.saldo)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-dark-600 pt-2 flex justify-between font-bold text-lg">
                  <span>TOTAL ASET</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatCurrency(totalAset)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Tidak ada aset</p>
            )}
          </div>
        </div>

        {/* Liabilities & Equity */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">LIABILITAS & EKUITAS</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Liabilities */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">LIABILITAS</h4>
              {liabilitas.length > 0 ? (
                <div className="space-y-2">
                  {liabilitas.map(item => (
                    <div key={item.nomor_akun} className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{item.nama_akun}</span>
                      <span className="font-medium">{formatCurrency(item.saldo)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-dark-600 pt-2 flex justify-between font-semibold">
                    <span>Total Liabilitas</span>
                    <span>{formatCurrency(totalLiabilitas)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Tidak ada liabilitas</p>
              )}
            </div>

            {/* Equity */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">EKUITAS</h4>
              <div className="space-y-2">
                {ekuitas.map(item => (
                  <div key={item.nomor_akun} className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{item.nama_akun}</span>
                    <span className="font-medium">{formatCurrency(item.saldo)}</span>
                  </div>
                ))}
                {labaRugi !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      {labaRugi >= 0 ? 'Laba Bersih' : 'Rugi Bersih'}
                    </span>
                    <span className="font-medium">{formatCurrency(labaRugi)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-dark-600 pt-2 flex justify-between font-bold">
                  <span>Total Ekuitas</span>
                  <span>{formatCurrency(totalEkuitas)}</span>
                </div>
                <div className="border-t border-gray-300 dark:border-dark-600 pt-2 flex justify-between font-bold text-lg">
                  <span>TOTAL LIABILITAS & EKUITAS</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalLiabilitas + totalEkuitas)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan Keuangan</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Laporan keuangan berdasarkan data transaksi
          </p>
        </div>
        <button className="btn-primary">
          <Download className="h-5 w-5 mr-2" />
          Export PDF
        </button>
      </div>

      {/* Report Tabs */}
      <div className="card p-4">
        <div className="flex space-x-1">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeReport === report.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {report.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      ) : (
        <div>
          {activeReport === 'neraca-saldo' && renderNeracaSaldo()}
          {activeReport === 'laba-rugi' && renderLabaRugi()}
          {activeReport === 'neraca' && renderNeraca()}
        </div>
      )}
    </div>
  );
};

export default Laporan;
