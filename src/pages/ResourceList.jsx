import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResource } from '../context/ResourceContext';
import Header from '../components/Header';
import { MdSearch, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';

const ResourceList = () => {
  const navigate = useNavigate();
  const { resources, deleteResource } = useResource();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const q = searchQuery.toLowerCase();
      return (
        res.employeeName.toLowerCase().includes(q) ||
        (res.nickname && res.nickname.toLowerCase().includes(q)) ||
        res.designation.toLowerCase().includes(q) ||
        res.mobileNumber.includes(q)
      );
    });
  }, [resources, searchQuery]);

  const confirmDelete = (id) => {
    setResourceToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (resourceToDelete) {
      await deleteResource(resourceToDelete);
      setIsModalOpen(false);
      setResourceToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col">
      <Header />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6 mb-6">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Resource List</h2>
              <button 
                onClick={() => navigate('/resources/add')}
                className="bg-[#4361ee] hover:bg-[#3b55d1] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm"
              >
                + New Resource
              </button>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <input 
                type="text" 
                placeholder="Search by Name, Nickname, Designation, Mobile..." 
                value={searchQuery}
                onChange={handleSearch}
                className="max-w-[400px] w-full px-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
              />
              <button className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-2 rounded text-sm font-medium transition-colors">
                Search
              </button>
            </div>

            <div className="w-full overflow-x-auto border border-gray-100 rounded">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                <thead>
                  <tr className="bg-[#f8f9fa] text-gray-700 text-sm border-b border-gray-100">
                    <th className="px-6 py-4 font-semibold">Employee Name</th>
                    <th className="px-6 py-4 font-semibold">Nickname</th>
                    <th className="px-6 py-4 font-semibold">Designation</th>
                    <th className="px-6 py-4 font-semibold">DOJ</th>
                    <th className="px-6 py-4 font-semibold">DOR</th>
                    <th className="px-6 py-4 font-semibold">Mobile Number</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {filteredResources.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{row.employeeName}</td>
                      <td className="px-6 py-4">{row.nickname}</td>
                      <td className="px-6 py-4">{row.designation}</td>
                      <td className="px-6 py-4">{row.doj}</td>
                      <td className="px-6 py-4">{row.dor || '-'}</td>
                      <td className="px-6 py-4">{row.mobileNumber}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f8ec] text-[#2ecc71] tracking-wide">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigate(`/resources/view/${row.id}`)}
                            className="bg-[#3498db] hover:bg-[#2980b9] text-white p-2 rounded shadow-sm transition-colors"
                            title="View"
                          >
                            <MdVisibility className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/resources/edit/${row.id}`)}
                            className="bg-[#f1c40f] hover:bg-[#d4ac0d] text-white p-2 rounded shadow-sm transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => confirmDelete(row.id)}
                            className="bg-[#e74c3c] hover:bg-[#c0392b] text-white p-2 rounded shadow-sm transition-colors"
                            title="Delete"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredResources.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No resources found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6 text-sm">Are you sure you want to delete this resource?</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium text-sm transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResourceList;
