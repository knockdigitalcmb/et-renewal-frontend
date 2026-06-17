import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResource } from '../context/ResourceContext';
import Header from '../components/Header';

const ViewResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResource } = useResource();
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
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col">
      <Header />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[800px] mx-auto bg-white rounded-md shadow-sm border border-gray-100">
          
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Resource Details</h2>
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
                <span className="block text-sm font-semibold text-gray-500 mb-1">Employee Name</span>
                <span className="text-gray-900 text-base">{resource.employeeName}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 mb-1">Nickname</span>
                <span className="text-gray-900 text-base">{resource.nickname || '-'}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 mb-1">Designation</span>
                <span className="text-gray-900 text-base">{resource.designation}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 mb-1">Mobile Number</span>
                <span className="text-gray-900 text-base">{resource.mobileNumber}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 mb-1">Date of Joining (DOJ)</span>
                <span className="text-gray-900 text-base">{resource.doj}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 mb-1">Date of Relieving (DOR)</span>
                <span className="text-gray-900 text-base">{resource.dor || '-'}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 mb-1">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f8ec] text-[#2ecc71] tracking-wide mt-1">
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
