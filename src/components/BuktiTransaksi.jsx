import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar } from 'lucide-react';
import { buktiTransaksiAPI } from '../services/api';

const BuktiTransaksi = () => {
  const [buktiTransaksis, setBuktiTransaksis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBukti, setEditingBukti] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nomor_bukti: '',
    tanggal_transaksi: new Date().toISOString().split('T')[0],
    deskripsi: '',
    referensi: ''
  });

  useEffect(() => {
    fetchBuktiTransaksis();
  }, []);

  const fetchBuktiTransaksis = async () => {
    try {
      setLoading(true);
      const response = await buktiTransaksiAPI.getAll();
      setBuktiTransaksis(response.data || []);
    } catch (error) {
      console.error('Error fetching bukti transaksi:', error);
      setBuktiTransaksis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBukti) {
        await buktiTransaksiAPI.update(editingBukti.id, formData);
      } else {
        await buktiTransaksiAPI.create(formData);
      }
      await fetchBuktiTransaksis();
      resetForm();
    } catch (error) {
      console.error('Error saving bukti transaksi:', error);
      alert('Error saving bukti transaksi. Please try again.');
    }
  };

  const handleEdit = (bukti) => {
    setEditingBukti(bukti);
    setFormData({
      nomor_bukti: bukti.nomor_bukti || '',
      tanggal_transaksi: bukti.tanggal_transaksi ? bukti.tanggal_transaksi.split('T')[0] : '',
      deskripsi: bukti.deskripsi || '',
      referensi: bukti.referensi || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction evidence?')) {
      try {
        await buktiTransaksiAPI.delete(id);
        await fetchBuktiTransaksis();
      } catch (error) {
        console.error('Error deleting bukti transaksi:', error);
        alert('Error deleting bukti transaksi. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nomor_bukti: '',
      tanggal_transaksi: new Date().toISOString().split('T')[0],
      deskripsi: '',
      referensi: ''
    });
    setEditingBukti(null);
    setShowModal(false);
  };

  const filteredBuktiTransaksis = buktiTransaksis.filter(bukti =>
    bukti.nomor_bukti?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bukti.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bukti.referensi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bukti Transaksi</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola bukti transaksi untuk dokumentasi keuangan
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Bukti
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari bukti transaksi..."
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
                <th className="table-header">Nomor Bukti</th>
                <th className="table-header">Tanggal Transaksi</th>
                <th className="table-header">Deskripsi</th>
                <th className="table-header">Referensi</th>
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
              ) : filteredBuktiTransaksis.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-cell text-center py-8 text-gray-500">
                    Tidak ada data bukti transaksi
                  </td>
                </tr>
              ) : (
                filteredBuktiTransaksis.map((bukti) => (
                  <tr key={bukti.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="table-cell font-medium">{bukti.nomor_bukti}</td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(bukti.tanggal_transaksi)}
                      </div>
                    </td>
                    <td className="table-cell">{bukti.deskripsi}</td>
                    <td className="table-cell">{bukti.referensi}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(bukti)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bukti.id)}
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
                    {editingBukti ? 'Edit Bukti Transaksi' : 'Tambah Bukti Transaksi Baru'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nomor Bukti
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nomor_bukti}
                        onChange={(e) => setFormData({...formData, nomor_bukti: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                        placeholder="Contoh: TRX001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tanggal Transaksi
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.tanggal_transaksi}
                        onChange={(e) => setFormData({...formData, tanggal_transaksi: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Deskripsi
                      </label>
                      <textarea
                        required
                        value={formData.deskripsi}
                        onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                        rows="3"
                        placeholder="Deskripsi transaksi..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Referensi
                      </label>
                      <input
                        type="text"
                        value={formData.referensi}
                        onChange={(e) => setFormData({...formData, referensi: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                        placeholder="Nomor invoice, kwitansi, dll."
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {editingBukti ? 'Update' : 'Simpan'}
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

export default BuktiTransaksi;
