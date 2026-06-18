import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useResource } from '../context/ResourceContext';
import { useVehicleType } from '../context/VehicleTypeContext';
import Header from '../components/Header';
import { useForm, useWatch } from 'react-hook-form';
import {
  restrictAlphabetsSpaces, restrictAlphanumeric, restrictNumbers, preventManualTyping,
  pasteAlphabetsSpaces, pasteAlphanumeric, pasteNumbers, trimData, regexPatterns,
  getTodayDateString, validatePastDate
} from '../utils/validationUtils';

const AddVehicle = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { addVehicle, checkDuplicateVehicle } = useCustomer();
  const { resources } = useResource();
  const activeResources = resources.filter(r => r.status === 'Active');

  const { vehicleTypes } = useVehicleType();
  const activeVehicleTypes = vehicleTypes.filter(t => t.status === 'Active');

  const { register, handleSubmit, control, setValue, watch, formState: { errors, dirtyFields } } = useForm({
    defaultValues: {
      devicePrice: 0,
      simPrice: 0,
      amountPaid: 0,
      validity: 12
    },
    mode: 'onChange'
  });

  const devicePrice = useWatch({ control, name: 'devicePrice', defaultValue: 0 });
  const simPrice = useWatch({ control, name: 'simPrice', defaultValue: 0 });
  const amountPaid = useWatch({ control, name: 'amountPaid', defaultValue: 0 });
  const installDate = useWatch({ control, name: 'installDate' });
  const validity = useWatch({ control, name: 'validity', defaultValue: 0 });

  // Auto Calculations
  useEffect(() => {
    const total = (parseFloat(devicePrice) || 0) + (parseFloat(simPrice) || 0);
    setValue('totalPayment', total);
    
    const pending = total - (parseFloat(amountPaid) || 0);
    setValue('pendingAmount', pending > 0 ? pending : 0);
  }, [devicePrice, simPrice, amountPaid, setValue]);

  useEffect(() => {
    if (installDate && validity) {
      const d = new Date(installDate);
      if (validity === '1 Month') d.setMonth(d.getMonth() + 1);
      else if (validity === '3 Months') d.setMonth(d.getMonth() + 3);
      else if (validity === '6 Months') d.setMonth(d.getMonth() + 6);
      else if (validity === '12 months' || validity === '1 Year') d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + parseInt(validity));
      
      setValue('expiryDate', d.toISOString().split('T')[0]);
    }
  }, [installDate, validity, setValue]);

  const onSubmit = async (data) => {
    const trimmedData = trimData(data);

    // Validate uniqueness
    if (checkDuplicateVehicle('vehicleNo', trimmedData.vehicleNo)) {
      alert(`Error: Vehicle Number "${trimmedData.vehicleNo}" is already registered to another customer.`);
      return;
    }
    if (checkDuplicateVehicle('imei', trimmedData.imei)) {
      alert(`Error: IMEI Number "${trimmedData.imei}" is already registered.`);
      return;
    }
    if (checkDuplicateVehicle('simNumber', trimmedData.simNumber)) {
      alert(`Error: SIM Number "${trimmedData.simNumber}" is already registered.`);
      return;
    }

    const totalPayment = (parseFloat(trimmedData.devicePrice) || 0) + (parseFloat(trimmedData.simPrice) || 0);
    const pendingAmount = totalPayment - (parseFloat(trimmedData.amountPaid) || 0);
    
    let expiryDate = '';
    if (trimmedData.installDate && trimmedData.validity) {
      const d = new Date(trimmedData.installDate);
      if (trimmedData.validity === '1 Month') d.setMonth(d.getMonth() + 1);
      else if (trimmedData.validity === '3 Months') d.setMonth(d.getMonth() + 3);
      else if (trimmedData.validity === '6 Months') d.setMonth(d.getMonth() + 6);
      else if (trimmedData.validity === '12 months' || trimmedData.validity === '1 Year') d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + parseInt(trimmedData.validity));
      expiryDate = d.toISOString().split('T')[0];
    }

    const payload = {
      ...trimmedData,
      totalPayment,
      pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
      expiryDate
    };

    await addVehicle(customerId, payload);
    alert('Vehicle added successfully');
    navigate(`/customers/edit/${customerId}`);
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 transition-colors";
    if (errors[fieldName]) return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    if (dirtyFields[fieldName] && !errors[fieldName] && watch(fieldName)) return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50`;
    return `${baseClass} border-gray-200 focus:border-blue-500 focus:ring-blue-500`;
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-6">
        <div className="bg-white rounded shadow-sm mx-auto border border-gray-200">
          
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="text-[1.1rem] font-bold text-gray-800">Add New Vehicle</h3>
            <button 
              onClick={() => navigate(`/customers/edit/${customerId}`)}
              className="bg-[#3498db] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#2980b9] transition-colors"
            >
              Back to Owner
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Vehicle Number *</label>
                  <input 
                    {...register('vehicleNo', { 
                      required: 'Vehicle Number is required',
                      pattern: { value: regexPatterns.vehicleNumber, message: 'Only alphabets and numbers allowed' }
                    })} 
                    onKeyDown={restrictAlphanumeric}
                    onPaste={pasteAlphanumeric}
                    className={getInputClass('vehicleNo')} 
                  />
                  {errors.vehicleNo && <p className="text-red-500 text-xs mt-1">{errors.vehicleNo.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Vehicle Type *</label>
                  <select 
                    {...register('vehicleType', { required: 'Please select Vehicle Type' })}
                    className={getInputClass('vehicleType')}
                  >
                    <option value="">Select Vehicle Type</option>
                    {activeVehicleTypes.map(type => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.vehicleType && <p className="text-red-500 text-xs mt-1">{errors.vehicleType.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">IMEI Number *</label>
                  <input 
                    {...register('imei', { 
                      required: 'IMEI is required',
                      pattern: { value: regexPatterns.imei, message: 'Must be exactly 15 digits' }
                    })} 
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('imei')} 
                  />
                  {errors.imei && <p className="text-red-500 text-xs mt-1">{errors.imei.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">SIM Number *</label>
                  <input 
                    {...register('simNumber', { 
                      required: 'SIM Number is required',
                      pattern: { value: regexPatterns.sim, message: 'Must be 10 or 13 digits' }
                    })} 
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('simNumber')} 
                  />
                  {errors.simNumber && <p className="text-red-500 text-xs mt-1">{errors.simNumber.message}</p>}
                </div>
              </div>
              
              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Device Model *</label>
                  <input 
                    {...register('deviceModel', { 
                      required: 'Device Model is required',
                      pattern: { value: regexPatterns.vehicleNumber, message: 'Only alphabets and numbers allowed' }
                    })} 
                    onKeyDown={restrictAlphanumeric}
                    onPaste={pasteAlphanumeric}
                    className={getInputClass('deviceModel')} 
                  />
                  {errors.deviceModel && <p className="text-red-500 text-xs mt-1">{errors.deviceModel.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Device Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register('devicePrice', { 
                      required: 'Device Price is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })} 
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('devicePrice')} 
                  />
                  {errors.devicePrice && <p className="text-red-500 text-xs mt-1">{errors.devicePrice.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">SIM Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register('simPrice', { 
                      required: 'SIM Price is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })} 
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('simPrice')} 
                  />
                  {errors.simPrice && <p className="text-red-500 text-xs mt-1">{errors.simPrice.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Total Payment (₹) - <span className="italic font-normal">Auto</span></label>
                  <input {...register('totalPayment')} readOnly className="w-full border border-gray-200 rounded px-3 py-2 text-[14px] bg-gray-100 cursor-not-allowed text-gray-600 font-semibold" />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Amount Paid (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register('amountPaid', { 
                      required: 'Amount Paid is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })} 
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('amountPaid')} 
                  />
                  {errors.amountPaid && <p className="text-red-500 text-xs mt-1">{errors.amountPaid.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Pending Amount (₹) - <span className="italic font-normal">Auto</span></label>
                  <input {...register('pendingAmount')} readOnly className="w-full border border-gray-200 rounded px-3 py-2 text-[14px] bg-gray-100 cursor-not-allowed text-gray-600 font-semibold" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Payment Mode *</label>
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
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Installation Person *</label>
                  <input 
                    {...register('installPerson', { 
                      required: 'Installation Person is required',
                      pattern: { value: regexPatterns.location, message: 'Only alphabets and spaces allowed' }
                    })} 
                    onKeyDown={restrictAlphabetsSpaces}
                    onPaste={pasteAlphabetsSpaces}
                    className={getInputClass('installPerson')} 
                  />
                  {errors.installPerson && <p className="text-red-500 text-xs mt-1">{errors.installPerson.message}</p>}
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Lead Closure By</label>
                  <select 
                    {...register('leadClosureBy', { required: 'Please select Lead Closure Employee' })} 
                    className={getInputClass('leadClosureBy')}
                  >
                    <option value="">Select Employee</option>
                    {activeResources.map(resource => (
                      <option key={resource.id} value={resource.employeeName}>
                        {resource.employeeName}
                      </option>
                    ))}
                  </select>
                  {errors.leadClosureBy && <p className="text-red-500 text-xs mt-1">{errors.leadClosureBy.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Installation Date *</label>
                  <input 
                    type="date" 
                    max={getTodayDateString()}
                    {...register('installDate', { 
                      required: 'Installation Date is required',
                      validate: validatePastDate
                    })} 
                    onKeyDown={preventManualTyping}
                    className={getInputClass('installDate')} 
                  />
                  {errors.installDate && <p className="text-red-500 text-xs mt-1">{errors.installDate.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Validity *</label>
                  <select {...register('validity', { required: 'Validity is required' })} className={getInputClass('validity')}>
                    <option value="">Select</option>
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 months">12 months</option>
                    <option value="13 months">13 months</option>
                    <option value="14 months">14 months</option>
                    <option value="15 months">15 months</option>
                    <option value="24 months">24 months</option>
                    <option value="27 months">27 months</option>
                    <option value="36 months">36 months</option>
                    <option value="48 months">48 months</option>
                    <option value="60 months">60 months</option>
                  </select>
                  {errors.validity && <p className="text-red-500 text-xs mt-1">{errors.validity.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Expiry Date * - <span className="italic font-normal">Auto</span></label>
                  <input type="date" {...register('expiryDate')} readOnly className="w-full border border-gray-200 rounded px-3 py-2 text-[14px] bg-gray-100 cursor-not-allowed text-gray-600 font-semibold" />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={Object.keys(errors).length > 0}
                  className={`w-full text-white py-2 rounded text-[14px] font-medium transition-colors ${Object.keys(errors).length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2ecc71] hover:bg-[#27ae60]'}`}
                >
                  Save New Vehicle
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AddVehicle;
