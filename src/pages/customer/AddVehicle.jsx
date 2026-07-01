import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import { useResource } from '../../context/ResourceContext';
import { useVehicleType } from '../../context/VehicleTypeContext';
import { useDeviceModel } from '../../context/DeviceModelContext';
import { useModal } from '../../context/ModalContext';
import Header from '../../components/layout/Header';
import { useForm, useWatch } from 'react-hook-form';
import NumericInput from '../../components/common/NumericInput';
import {
  restrictAlphabetsSpaces, restrictAlphanumeric, restrictNumbers, preventManualTyping,
  pasteAlphabetsSpaces, pasteAlphanumeric, pasteNumbers, trimData, regexPatterns,
  getTodayDateString, validatePastDate
} from '../../utils/validationUtils';

const AddVehicle = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { showModal } = useModal();
  const { addVehicle, checkDuplicateVehicle } = useCustomer();
  const { resources } = useResource();
  const { vehicleTypes } = useVehicleType();
  const { deviceModels } = useDeviceModel();

  const activeResources = resources.filter(r => r.status === 'Active');
  const activeVehicleTypes = vehicleTypes.filter(t => t.status === 'Active');

  const { register, handleSubmit, control, setValue, watch, formState: { errors, dirtyFields } } = useForm({
    defaultValues: {
      totalSaleAmount: 0,
      deviceAmount: 0,
      simAmount: 0,
      softwareAmount: 0,
      technicianAmount: 0,
      courierAmount: 0,
      amountPaid: 0,
      validity: 12
    },
    mode: 'onChange'
  });

  const totalSaleAmount = useWatch({ control, name: 'totalSaleAmount', defaultValue: 0 });
  const deviceAmount = useWatch({ control, name: 'deviceAmount', defaultValue: 0 });
  const simAmount = useWatch({ control, name: 'simAmount', defaultValue: 0 });
  const softwareAmount = useWatch({ control, name: 'softwareAmount', defaultValue: 0 });
  const technicianAmount = useWatch({ control, name: 'technicianAmount', defaultValue: 0 });
  const courierAmount = useWatch({ control, name: 'courierAmount', defaultValue: 0 });
  const amountPaid = useWatch({ control, name: 'amountPaid', defaultValue: 0 });
  const installDate = useWatch({ control, name: 'installDate' });
  const validity = useWatch({ control, name: 'validity', defaultValue: 0 });

  // Auto Calculations
  const parseNum = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    const total = parseNum(deviceAmount) + parseNum(simAmount) + parseNum(softwareAmount) + parseNum(technicianAmount) + parseNum(courierAmount);
    setValue('totalAmount', total);
    
    if (parseNum(totalSaleAmount) === total) {
      const pending = total - parseNum(amountPaid);
      setValue('pendingAmount', pending > 0 ? pending : 0);
    } else {
      setValue('pendingAmount', 0);
    }
  }, [totalSaleAmount, deviceAmount, simAmount, softwareAmount, technicianAmount, courierAmount, amountPaid, setValue]);

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
      showModal({ type: 'error', title: 'Duplicate Found', message: `Vehicle Number "${trimmedData.vehicleNo}" is already registered to another customer.` });
      return;
    }
    if (checkDuplicateVehicle('imei', trimmedData.imei)) {
      showModal({ type: 'error', title: 'Duplicate Found', message: `IMEI Number "${trimmedData.imei}" is already registered.` });
      return;
    }
    if (checkDuplicateVehicle('simNumber', trimmedData.simNumber)) {
      showModal({ type: 'error', title: 'Duplicate Found', message: `SIM Number "${trimmedData.simNumber}" is already registered.` });
      return;
    }

    const totalSaleAmountNum = parseNum(trimmedData.totalSaleAmount);
    const totalAmountNum = parseNum(trimmedData.totalAmount);

    if (totalSaleAmountNum !== totalAmountNum) {
      showModal({ type: 'error', title: 'Validation Error', message: 'Total Sale Amount must match Total Amount' });
      return;
    }

    const pendingAmount = totalAmountNum - parseNum(trimmedData.amountPaid);

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
      totalAmount: totalAmountNum,
      pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
      expiryDate
    };

    await addVehicle(customerId, payload);
    showModal({
      type: 'success',
      title: 'Success',
      message: 'Vehicle added successfully!',
      buttons: [
        { text: 'View Owner', style: 'primary', onClick: () => navigate(`/customers/edit/${customerId}`) },
        { text: 'Close', style: 'secondary' }
      ]
    });
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
                      pattern: { 
                        value: regexPatterns.vehicleNumber, 
                        message: 'Enter valid Vehicle Number' 
                      }
                    })} 
                    onInput={(e) => e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')}
                    onKeyDown={restrictAlphanumeric}
                    onPaste={pasteAlphanumeric}
                    className={getInputClass('vehicleNo')} 
                  />
                  {errors.vehicleNo && <p className="text-red-500 text-xs mt-1">{errors.vehicleNo.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Platform *</label>
                  <select
                    {...register('platform', { required: 'Platform is required' })}
                    className={getInputClass('platform')}
                  >
                    <option value="">Select</option>
                    <option value="Tracco">Tracco</option>
                    <option value="EagleIndia">EagleIndia</option>
                    <option value="Treckin">Treckin</option>
                    <option value="GPS Monitor">GPS Monitor</option>
                    <option value="Onequik">Onequik</option>
                    <option value="Nowilup">Nowilup</option>
                  </select>
                  {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform.message}</p>}
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
                  <NumericInput
                    {...register('simNumber', {
                      required: 'SIM Number is required',
                      pattern: { value: regexPatterns.sim, message: 'Must be 10 or 13 digits' }
                    })}
                    className={getInputClass('simNumber')}
                  />
                  {errors.simNumber && <p className="text-red-500 text-xs mt-1">{errors.simNumber.message}</p>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Device Model *</label>
                  <select
                    {...register('deviceModel', { required: 'Device Model is required' })}
                    className={getInputClass('deviceModel')}
                  >
                    <option value="">Select</option>
                    {activeDeviceModels.map(dm => (
                      <option key={dm.id} value={dm.name}>{dm.name}</option>
                    ))}
                  </select>
                  {errors.deviceModel && <p className="text-red-500 text-xs mt-1">{errors.deviceModel.message}</p>}
                </div>
              </div>

              {/* Financial Details Section */}
              <div className="bg-white rounded-md shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
                <div className="flex items-center mb-6 pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-800">Financial Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Payment Mode *</label>
                    <select {...register('paymentMode', { required: 'Payment Mode is required' })} className={getInputClass('paymentMode')}>
                      <option value="">Select Mode</option>
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
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Transaction ID (Last 6 Digits) *</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      {...register('transactionId', { 
                        required: 'Transaction ID is required',
                        pattern: { value: /^\d{6}$/, message: 'Please enter exactly 6 digits.' }
                      })}
                      onKeyDown={restrictNumbers}
                      onPaste={pasteNumbers}
                      className={getInputClass('transactionId')}
                      placeholder="e.g. 987654"
                    />
                    {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Total Sale Amount (₹) *</label>
                    <NumericInput {...register('totalSaleAmount', { 
                        required: 'Total Sale Amount is required',
                        min: { value: 0, message: 'Cannot be negative' }
                      })}
                      className={getInputClass('totalSaleAmount')}
                      defaultToZero 
                    />
                    {errors.totalSaleAmount && <p className="text-red-500 text-xs mt-1">{errors.totalSaleAmount.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Device Amount (₹) *</label>
                    <NumericInput step="0.01" 
                      {...register('deviceAmount', { 
                        required: 'Device Amount is required',
                        min: { value: 0, message: 'Cannot be negative' }
                      })} 
                      className={getInputClass('deviceAmount')} 
                    defaultToZero />
                    {errors.deviceAmount && <p className="text-red-500 text-xs mt-1">{errors.deviceAmount.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">SIM Amount (₹) *</label>
                    <NumericInput step="0.01" 
                      {...register('simAmount', { 
                        required: 'SIM Amount is required',
                        min: { value: 0, message: 'Cannot be negative' }
                      })} 
                      className={getInputClass('simAmount')} 
                    defaultToZero />
                    {errors.simAmount && <p className="text-red-500 text-xs mt-1">{errors.simAmount.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Software Amount (₹)</label>
                    <NumericInput step="0.01" 
                      {...register('softwareAmount', { 
                        min: { value: 0, message: 'Cannot be negative' }
                      })} 
                      className={getInputClass('softwareAmount')} 
                    defaultToZero />
                    {errors.softwareAmount && <p className="text-red-500 text-xs mt-1">{errors.softwareAmount.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Technician Amount (₹)</label>
                    <NumericInput step="0.01" 
                      {...register('technicianAmount', { 
                        min: { value: 0, message: 'Cannot be negative' }
                      })} 
                      className={getInputClass('technicianAmount')} 
                    defaultToZero />
                    {errors.technicianAmount && <p className="text-red-500 text-xs mt-1">{errors.technicianAmount.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Courier Amount (₹)</label>
                    <NumericInput step="0.01" 
                      {...register('courierAmount', { 
                        min: { value: 0, message: 'Cannot be negative' }
                      })} 
                      className={getInputClass('courierAmount')} 
                    defaultToZero />
                    {errors.courierAmount && <p className="text-red-500 text-xs mt-1">{errors.courierAmount.message}</p>}
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Total Amount (₹) - <span className="italic font-normal text-blue-500">Auto</span></label>
                    <input {...register('totalAmount')} readOnly className="w-full border border-gray-200 rounded px-3 py-2 text-[14px] bg-gray-100 cursor-not-allowed text-gray-600 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Amount Paid (₹) *</label>
                    <NumericInput step="0.01" 
                      {...register('amountPaid', { 
                        required: 'Amount Paid is required',
                        min: { value: 0, message: 'Cannot be negative' }
                      })} 
                      className={getInputClass('amountPaid')} 
                    defaultToZero />
                    {errors.amountPaid && <p className="text-red-500 text-xs mt-1">{errors.amountPaid.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Pending Amount (₹) - <span className="italic font-normal text-blue-500">Auto</span></label>
                    <input {...register('pendingAmount')} readOnly className={`w-full border border-gray-200 rounded px-3 py-2 text-[14px] bg-gray-100 cursor-not-allowed font-bold ${watch('pendingAmount') > 0 ? 'text-red-500' : 'text-green-600'}`} />
                  </div>
                </div>
              </div>

              {/* Installation Details Section */}
              <div className="bg-white rounded-md shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
                <div className="flex items-center mb-6 pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-800">Installation Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  disabled={Object.keys(errors).length > 0 || parseFloat(watch('totalSaleAmount')) !== parseFloat(watch('totalAmount'))}
                  className={`w-full text-white py-2 rounded text-[14px] font-medium transition-colors ${(Object.keys(errors).length > 0 || parseFloat(watch('totalSaleAmount')) !== parseFloat(watch('totalAmount'))) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2ecc71] hover:bg-[#27ae60]'}`}
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
