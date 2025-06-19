import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { akunAPI } from '../services/api';

const AkunManagement = () => {
  const [akuns, setAkuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAkun, setEditingAkun] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nomor_akun: '',
    nama_akun: '',
    kelompok_akun: '',
    posisi_saldo_normal: 'Debet'
  });

  const kelompokAkunOptions = [
    'Aset Lancar',
    'Aset Tetap',
    'Liabilitas Jangka Pendek',
    'Liabilitas Jangka Panjang',
    'Ekuitas',
    'Pendapatan',
    'Beban'
  ];

  useEffect(() => {
    fetchAkuns();
  }, []);

  const fetchAkuns = async () => {
    try {
      setLoading(true);
      const response = await akunAPI.getAll();
      setAkuns(response.data || []);
    } catch (error) {
      console.error('Error fetching akuns:', error);
      setAkuns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAkun) {
        await akunAPI.update(editingAkun.nomor_akun, formData);
      } else {
        await akunAPI.create(formData);
      }
      await fetchAkuns();
      resetForm();
    } catch (error) {
      console.error('Error saving akun:', error);
      alert('Error saving akun. Please try again.');
    }
  };

  const handleEdit = (akun) => {
    setEditingAkun(akun);
    setFormData({
      nomor_akun: akun.nomor_akun,
      nama_akun: akun.nama_akun,
      kelompok_akun: akun.kelompok_akun,
      posisi_saldo_normal: akun.posisi_saldo_normal
    });
    setShowModal(true);
  };

  const handleDelete = async (nomorAkun) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await akunAPI.delete(nomorAkun);
        await fetchAkuns();
      } catch (error) {
        console.error('Error deleting akun:', error);
        alert('Error deleting akun. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nomor_akun: '',
      nama_akun: '',
      kelompok_akun: '',
      posisi_saldo_normal: 'Debet'
    });
    setEditingAkun(null);
    setShowModal(false);
  };

  const filteredAkuns = akuns.filter(akun =>
    akun.nama_akun?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    akun.nomor_akun?.toString().includes(searchTerm) ||
    akun.kelompok_akun?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daftar Akun</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola chart of accounts untuk sistem akuntansi
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Akun
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari akun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead className="bg-gray-50 dark:bg-dark-800">
              <tr>
                <th className="table-header">Nomor Akun</th>
                <th className="table-header">Nama Akun</th>
                <th className="table-header">Kelompok Akun</th>
                <th className="table-header">Posisi Saldo Normal</th>
                <th className="table-header">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="table-cell text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : filteredAkuns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-cell text-center py-8 text-gray-500">
                    Tidak ada data akun
                  </td>
                </tr>
              ) : (
                filteredAkuns.map((akun) => (
                  <tr key={akun.nomor_akun} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="table-cell font-medium">{akun.nomor_akun}</td>
                    <td className="table-cell">{akun.nama_akun}</td>
                    <td className="table-cell">{akun.kelompok_akun}</td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        akun.posisi_saldo_normal === 'Debet' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {akun.posisi_saldo_normal}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(akun)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(akun.nomor_akun)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white dark:bg-dark-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {editingAkun ? 'Edit Akun' : 'Tambah Akun Baru'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nomor Akun
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nomor_akun}
                        onChange={(e) => setFormData({...formData, nomor_akun: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                        disabled={editingAkun}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nama Akun
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nama_akun}
                        onChange={(e) => setFormData({...formData, nama_akun: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kelompok Akun
                      </label>
                      <select
                        required
                        value={formData.kelompok_akun}
                        onChange={(e) => setFormData({...formData, kelompok_akun: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                      >
                        <option value="">Pilih Kelompok</option>
                        {kelompokAkunOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Posisi Saldo Normal
                      </label>
                      <select
                        value={formData.posisi_saldo_normal}
                        onChange={(e) => setFormData({...formData, posisi_saldo_normal: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                      >
                        <option value="Debet">Debet</option>
                        <option value="Kredit">Kredit</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {editingAkun ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AkunManagement;
