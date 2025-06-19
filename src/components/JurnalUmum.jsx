import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar } from 'lucide-react';
import { jurnalUmumAPI, akunAPI } from '../services/api';

const JurnalUmum = () => {
  const [jurnals, setJurnals] = useState([]);
  const [akuns, setAkuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJurnal, setEditingJurnal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    no_bukti: '',
    deskripsi: '',
    no_akun: '',
    nama_akun: '',
    debet: '',
    kredit: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jurnalResponse, akunResponse] = await Promise.all([
        jurnalUmumAPI.getAll(),
        akunAPI.getAll()
      ]);
      setJurnals(jurnalResponse.data || []);
      setAkuns(akunResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const debet = parseFloat(formData.debet) || 0;
    const kredit = parseFloat(formData.kredit) || 0;
    
    if (debet === 0 && kredit === 0) {
      alert('Debet atau Kredit harus diisi');
      return;
    }
    
    if (debet > 0 && kredit > 0) {
      alert('Hanya boleh mengisi Debet atau Kredit, tidak keduanya');
      return;
    }

    try {
      const selectedAkun = akuns.find(akun => akun.nomor_akun === formData.no_akun);
      const dataToSend = {
        ...formData,
        nama_akun: selectedAkun?.nama_akun || formData.nama_akun,
        debet: debet,
        kredit: kredit
      };

      if (editingJurnal) {
        await jurnalUmumAPI.update(editingJurnal.id, dataToSend);
      } else {
        await jurnalUmumAPI.create(dataToSend);
      }
      await fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving jurnal:', error);
      alert('Error saving jurnal. Please try again.');
    }
  };

  const handleEdit = (jurnal) => {
    setEditingJurnal(jurnal);
    setFormData({
      tanggal: jurnal.tanggal ? jurnal.tanggal.split('T')[0] : '',
      no_bukti: jurnal.no_bukti || '',
      deskripsi: jurnal.deskripsi || '',
      no_akun: jurnal.no_akun || '',
      nama_akun: jurnal.nama_akun || '',
      debet: jurnal.debet || '',
      kredit: jurnal.kredit || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await jurnalUmumAPI.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting jurnal:', error);
        alert('Error deleting jurnal. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      no_bukti: '',
      deskripsi: '',
      no_akun: '',
      nama_akun: '',
      debet: '',
      kredit: ''
    });
    setEditingJurnal(null);
    setShowModal(false);
  };

  const handleAkunChange = (nomorAkun) => {
    const selectedAkun = akuns.find(akun => akun.nomor_akun === nomorAkun);
    setFormData({
      ...formData,
      no_akun: nomorAkun,
      nama_akun: selectedAkun?.nama_akun || ''
    });
  };

  const filteredJurnals = jurnals.filter(jurnal =>
    jurnal.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jurnal.no_bukti?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jurnal.nama_akun?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jurnal Umum</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola entri jurnal umum untuk transaksi harian
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Jurnal
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari jurnal..."
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
                <th className="table-header">Tanggal</th>
                <th className="table-header">No Bukti</th>
                <th className="table-header">Deskripsi</th>
                <th className="table-header">No Akun</th>
                <th className="table-header">Nama Akun</th>
                <th className="table-header">Debet</th>
                <th className="table-header">Kredit</th>
                <th className="table-header">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="table-cell text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : filteredJurnals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-cell text-center py-8 text-gray-500">
                    Tidak ada data jurnal
                  </td>
                </tr>
              ) : (
                filteredJurnals.map((jurnal) => (
                  <tr key={jurnal.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(jurnal.tanggal)}
                      </div>
                    </td>
                    <td className="table-cell font-medium">{jurnal.no_bukti}</td>
                    <td className="table-cell">{jurnal.deskripsi}</td>
                    <td className="table-cell">{jurnal.no_akun}</td>
                    <td className="table-cell">{jurnal.nama_akun}</td>
                    <td className="table-cell">
                      {jurnal.debet > 0 && (
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(jurnal.debet)}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {jurnal.kredit > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(jurnal.kredit)}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(jurnal)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(jurnal.id)}
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
                    {editingJurnal ? 'Edit Jurnal' : 'Tambah Jurnal Baru'}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tanggal
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.tanggal}
                          onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          No Bukti
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.no_bukti}
                          onChange={(e) => setFormData({...formData, no_bukti: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                        />
                      </div>
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Akun
                      </label>
                      <select
                        required
                        value={formData.no_akun}
                        onChange={(e) => handleAkunChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                      >
                        <option value="">Pilih Akun</option>
                        {akuns.map(akun => (
                          <option key={akun.nomor_akun} value={akun.nomor_akun}>
                            {akun.nomor_akun} - {akun.nama_akun}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Debet
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.debet}
                          onChange={(e) => setFormData({...formData, debet: e.target.value, kredit: ''})}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Kredit
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.kredit}
                          onChange={(e) => setFormData({...formData, kredit: e.target.value, debet: ''})}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {editingJurnal ? 'Update' : 'Simpan'}
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

export default JurnalUmum;
