import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useResource } from '../context/ResourceContext';
import Header from '../components/Header';
import {
  restrictAlphabetsSpaces, restrictNumbers, preventManualTyping,
  pasteAlphabetsSpaces, pasteNumbers, trimData, regexPatterns,
  getTodayDateString, validatePastDate
} from '../utils/validationUtils';

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResource, updateResource, isLoading } = useResource();

  const { register, handleSubmit, reset, watch, formState: { errors, dirtyFields } } = useForm({
    defaultValues: {
      employeeName: '',
      nickname: '',
      designation: '',
      mobileNumber: '',
      doj: '',
      dor: ''
    },
    mode: 'onChange'
  });

  useEffect(() => {
    const data = getResource(id);
    if (data) {
      reset(data);
    } else {
      navigate('/resources/list');
    }
  }, [id, getResource, navigate, reset]);

  const onSubmit = async (data) => {
    const trimmedData = trimData(data);
    const res = await updateResource(id, trimmedData);
    if (res.success) {
      alert("Resource updated successfully!");
      navigate('/resources/list'); 
    }
  };

  const InputLabel = ({ label, required }) => (
    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
      {label} {required && '*'}
    </label>
  );

  const ErrorMsg = ({ error }) => {
    if (!error) return null;
    return <p className="text-red-500 text-xs mt-1">{error.message}</p>;
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full h-[44px] px-3 border rounded-[4px] focus:outline-none focus:ring-1 text-sm transition-colors";
    if (errors[fieldName]) return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    if (dirtyFields[fieldName] && !errors[fieldName] && watch(fieldName)) return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50`;
    return `${baseClass} border-gray-200 focus:border-blue-500 focus:ring-blue-500`;
  };

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col">
      <Header />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto bg-white rounded-md shadow-sm border border-gray-100">
          
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Edit Resource</h2>
            <button 
              onClick={() => navigate('/resources/list')}
              className="px-5 py-2 border border-gray-300 rounded-[4px] font-medium text-sm transition-colors shadow-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <InputLabel label="Employee Name" required />
                  <input 
                    type="text" 
                    {...register('employeeName', { 
                      required: 'Employee Name is required',
                      pattern: { value: regexPatterns.location, message: 'Only alphabets and spaces allowed' }
                    })}
                    onKeyDown={restrictAlphabetsSpaces}
                    onPaste={pasteAlphabetsSpaces}
                    className={getInputClass('employeeName')}
                  />
                  <ErrorMsg error={errors.employeeName} />
                </div>
                <div>
                  <InputLabel label="Nickname" />
                  <input 
                    type="text" 
                    {...register('nickname', {
                      pattern: { value: regexPatterns.location, message: 'Only alphabets and spaces allowed' }
                    })}
                    onKeyDown={restrictAlphabetsSpaces}
                    onPaste={pasteAlphabetsSpaces}
                    className={getInputClass('nickname')}
                  />
                  <ErrorMsg error={errors.nickname} />
                </div>
                <div>
                  <InputLabel label="Designation" required />
                  <input 
                    type="text" 
                    {...register('designation', { 
                      required: 'Designation is required',
                      pattern: { value: regexPatterns.location, message: 'Only alphabets and spaces allowed' }
                    })}
                    onKeyDown={restrictAlphabetsSpaces}
                    onPaste={pasteAlphabetsSpaces}
                    className={getInputClass('designation')}
                  />
                  <ErrorMsg error={errors.designation} />
                </div>
                <div>
                  <InputLabel label="Mobile Number" required />
                  <input 
                    type="text" 
                    {...register('mobileNumber', { 
                      required: 'Mobile Number is required',
                      pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' }
                    })}
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('mobileNumber')}
                  />
                  <ErrorMsg error={errors.mobileNumber} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div>
                  <InputLabel label="Date of Joining (DOJ)" required />
                  <input 
                    type="date" 
                    max={getTodayDateString()}
                    {...register('doj', { 
                      required: 'Date of Joining is required',
                      validate: validatePastDate
                    })}
                    onKeyDown={preventManualTyping}
                    className={getInputClass('doj')}
                  />
                  <ErrorMsg error={errors.doj} />
                </div>
                <div>
                  <InputLabel label="Date of Relieving (DOR)" />
                  <input 
                    type="date" 
                    max={getTodayDateString()}
                    {...register('dor', {
                      validate: validatePastDate
                    })}
                    onKeyDown={preventManualTyping}
                    className={getInputClass('dor')}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || Object.keys(errors).length > 0}
                className={`w-full h-[48px] rounded-[6px] text-white font-medium shadow-sm transition-colors ${Object.keys(errors).length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4361ee] hover:bg-[#3411b0]'}`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditResource;
