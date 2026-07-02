import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { useModal } from '../../context/ModalContext';

const ImportCustomers = () => {
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      showModal({ type: 'warning', title: 'File Required', message: 'Please choose an excel file to import.' });
      return;
    }
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      showModal({ type: 'warning', title: 'Invalid File', message: 'Only Excel (.xlsx, .xls) files are allowed.' });
      return;
    }
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('accessToken');

      const response = await fetch('http://103.235.105.121:3000/api/v1/imports/customers-excel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setLoading(false);
        showModal({
          type: 'success',
          title: 'Import Successful',
          message: data.message,
          buttons: [
            { text: 'View Customers', style: 'primary', onClick: () => navigate('/customers') },
            { text: 'Close', style: 'secondary' },
          ],
        });
      } else {
        setLoading(false);
        showModal({
          type: 'error',
          title: 'Import Failed',
          message: data.message || 'An unexpected error occurred. Please try again.',
        });
      }
    } catch (error) {
      setLoading(false);
      showModal({
        type: 'error',
        title: 'Import Failed',
        message: 'Unable to upload the file. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col">
      <Header />
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Import Customers</h2>
          <p className="text-sm text-gray-500 mb-8">Upload an Excel (.xlsx, .xls) file to import multiple customers at once.</p>
          
          <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg mb-8 hover:bg-gray-50 transition-colors">
            <input 
              type="file" 
              accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/customers')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={loading}
              className="flex-1 bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-70"
            >
              {loading ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImportCustomers;
