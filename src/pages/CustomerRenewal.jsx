import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import Header from '../components/Header';
import { useForm, useWatch } from 'react-hook-form';
import {
  restrictNumbers, preventManualTyping, pasteNumbers, trimData,
  getTodayDateString, validatePastDate
} from '../utils/validationUtils';

const CustomerRenewal = () => {
  const { id: vehicleId } = useParams(); // URL might pass vehicleId as id
  const navigate = useNavigate();
  const { getVehicle, getCustomer, updateVehicle, addRenewal } = useCustomer();
  const [vehicle, setVehicle] = useState(null);
  const [notesLength, setNotesLength] = useState(0);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, dirtyFields } } = useForm({
    defaultValues: {
      renewalDate: new Date().toISOString().split('T')[0],
      validity: '12 Months'
    },
    mode: 'onChange'
  });

  const validity = useWatch({ control, name: 'validity' });
  const notes = useWatch({ control, name: 'notes' });

  useEffect(() => {
    let data = getVehicle(vehicleId);
    if (!data) {
      const cust = getCustomer(vehicleId);
      if (cust && cust.vehicles && cust.vehicles.length > 0) {
        data = { ...cust.vehicles[0], customerId: cust.id };
      }
    }

    if (data) {
      setVehicle(data);
    } else {
      navigate('/customers');
    }
  }, [vehicleId, getVehicle, getCustomer, navigate]);

  useEffect(() => {
    if (vehicle && vehicle.expiryDate && validity) {
      const d = new Date(vehicle.expiryDate);
      d.setMonth(d.getMonth() + parseInt(validity));
      setValue('newExpiryDate', d.toISOString().split('T')[0]);
    }
  }, [vehicle, validity, setValue]);

  useEffect(() => {
    setNotesLength(notes ? notes.length : 0);
  }, [notes]);

  const onSubmit = async (data) => {
    const trimmedData = trimData(data);

    // Calculate new expiry date based on current expiry
    let newExpiryDate = '';
    if (vehicle.expiryDate && trimmedData.validity) {
      const d = new Date(vehicle.expiryDate);
      d.setMonth(d.getMonth() + parseInt(trimmedData.validity));
      newExpiryDate = d.toISOString().split('T')[0];
    }

    // Get customer name
    const cust = getCustomer(vehicle.customerId);
    const customerName = cust ? cust.name : vehicle.customerId;

    // 1. Update Vehicle Expiry
    await updateVehicle(vehicleId, {
      expiryDate: newExpiryDate
    });

    // 2. Create Renewal History Record
    addRenewal({
      customerId: vehicle.customerId,
      customer: customerName,
      vehicleNo: vehicle.vehicleNo,
      renewalDate: trimmedData.renewalDate,
      amount: `₹${trimmedData.renewalAmount}`,
      validity: trimmedData.validity,
      oldExpiry: vehicle.expiryDate,
      newExpiry: newExpiryDate,
      paymentMode: trimmedData.paymentMode,
      notes: trimmedData.notes
    });

    alert('Renewal Processed Successfully');
    navigate('/renewals');
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 transition-colors";
    if (errors[fieldName]) return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    if (dirtyFields[fieldName] && !errors[fieldName] && watch(fieldName)) return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50`;
    return `${baseClass} border-gray-200 focus:border-blue-500 focus:ring-blue-500`;
  };

  if (!vehicle) return null;
  const cust = getCustomer(vehicle.customerId);
  const displayCustomerName = cust ? cust.name : vehicle.customerId;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Header />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="flex justify-between items-center bg-white p-4 rounded shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">Add Renewal</h1>
            <button 
              onClick={() => navigate(`/customers/view/${vehicle.customerId}`)}
              className="bg-gray-600 text-white px-4 py-2 rounded font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Customer
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">Customer Name</p>
              <p className="text-blue-900 font-bold">{displayCustomerName}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">Vehicle No</p>
              <p className="text-blue-900 font-bold">{vehicle.vehicleNo}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-semibold mb-1">Current Expiry Date</p>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {vehicle.expiryDate}
              </span>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Date *</label>
                  <input 
                    type="date" 
                    max={getTodayDateString()}
                    {...register('renewalDate', { 
                      required: 'Renewal Date is required',
                      validate: validatePastDate
                    })} 
                    onKeyDown={preventManualTyping}
                    className={getInputClass('renewalDate')} 
                  />
                  {errors.renewalDate && <p className="text-red-500 text-xs mt-1">{errors.renewalDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Amount (₹) *</label>
                  <input 
                    type="number" 
                    {...register('renewalAmount', { 
                      required: 'Renewal Amount is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })} 
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('renewalAmount')} 
                  />
                  {errors.renewalAmount && <p className="text-red-500 text-xs mt-1">{errors.renewalAmount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Months) *</label>
                  <select {...register('validity', { required: 'Validity is required' })} className={getInputClass('validity')}>
                    <option value="">Select</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                    <option value="13 Months">13 Months</option>
                    <option value="14 Months">14 Months</option>
                    <option value="15 Months">15 Months</option>
                    <option value="24 Months">24 Months</option>
                    <option value="27 Months">27 Months</option>
                    <option value="36 Months">36 Months</option>
                    <option value="48 Months">48 Months</option>
                    <option value="60 Months">60 Months</option>
                  </select>
                  {errors.validity && <p className="text-red-500 text-xs mt-1">{errors.validity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Expiry Date * - Auto</label>
                  <input type="date" {...register('newExpiryDate')} readOnly className="w-full border border-gray-200 rounded px-3 py-2 bg-gray-50 text-gray-500 font-medium cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                  <select {...register('paymentMode', { required: 'Payment Mode is required' })} className={getInputClass('paymentMode')}>
                    <option value="">Select</option>
                    <option value="ET Gpay">ET Gpay</option>
                    <option value="ET Phonepe">ET Phonepe</option>
                    <option value="ET Paytm">ET Paytm</option>
                    <option value="ET Account">ET Account</option>
                    <option value="ET Cheque">ET Cheque</option>
                    <option value="8002 Gpay">8002 Gpay</option>
                    <option value="8002 Paytm">8002 Paytm</option>
                    <option value="8002 PhonePe">8002 PhonePe</option>
                    <option value="8002 Account">8002 Account</option>
                    <option value="WATI Gpay">WATI Gpay</option>
                    <option value="WATI Paytm">WATI Paytm</option>
                    <option value="WATI PhonePe">WATI PhonePe</option>
                    <option value="WATI Account">WATI Account</option>
                    <option value="Cash">Cash</option>
                    <option value="CC Payment Gateway">CC Payment Gateway</option>
                  </select>
                  {errors.paymentMode && <p className="text-red-500 text-xs mt-1">{errors.paymentMode.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Max 500 chars)</label>
                <textarea 
                  {...register('notes', { maxLength: 500 })} 
                  rows="3" 
                  className={getInputClass('notes')}
                ></textarea>
                <div className="text-right text-xs text-gray-400 mt-1">
                  {notesLength} / 500
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={Object.keys(errors).length > 0}
                  className={`px-6 py-2 rounded font-medium text-white transition-colors ${Object.keys(errors).length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  Process Renewal
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CustomerRenewal;
