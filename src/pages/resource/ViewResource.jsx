import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResource } from '../../context/ResourceContext';
import { useSettings } from '../../context/SettingsContext';
import Header from '../../components/layout/Header';

const ViewResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResource } = useResource();
  const { formatDate } = useSettings();
  const [resource, setResource] = useState(null);

  useEffect(() => {
    const data = getResource(id);
    if (data) {
      setResource(data);
    } else {
      navigate('/resources/list');
    }
  }, [id, getResource, navigate]);

  if (!resource) return null;

  return (
    <div className="min-h-screen bg-[#f1f3f5] dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <Header />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[800px] mx-auto bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Resource Details</h2>
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate(`/resources/edit/${id}`)}
                className="bg-[#f1c40f] hover:bg-[#d4ac0d] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm"
              >
                Edit Resource
              </button>
              <button 
                onClick={() => navigate('/resources/list')}
                className="bg-[#3498db] hover:bg-[#2980b9] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm"
              >
                Back
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Employee Name</span>
                <span className="text-gray-900 dark:text-gray-200 text-base">{resource.employeeName}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Nickname</span>
                <span className="text-gray-900 dark:text-gray-200 text-base">{resource.nickname || '-'}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Designation</span>
                <span className="text-gray-900 dark:text-gray-200 text-base">{resource.designation}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Mobile Number</span>
                <span className="text-gray-900 dark:text-gray-200 text-base">{resource.mobileNumber}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Date of Joining (DOJ)</span>
                <span className="text-gray-900 dark:text-gray-200 text-base">{formatDate(resource.doj)}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Date of Relieving (DOR)</span>
                <span className="text-gray-900 dark:text-gray-200 text-base">{resource.dor ? formatDate(resource.dor) : '-'}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide mt-1 ${resource.status === 'Active' ? 'bg-[#e6f8ec] dark:bg-green-900/30 text-[#2ecc71] dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
                  {resource.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewResource;
