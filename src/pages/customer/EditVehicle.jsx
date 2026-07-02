import NumericInput from '../../components/common/NumericInput';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import { useResource } from '../../context/ResourceContext';
import { useVehicleType } from '../../context/VehicleTypeContext';
import { useDeviceModel } from '../../context/DeviceModelContext';
import { useImei } from '../../context/ImeiContext';
import { useSim } from '../../context/SimContext';
import { useModal } from '../../context/ModalContext';
import Header from '../../components/layout/Header';
import { useForm, useWatch } from 'react-hook-form';
import {
  restrictAlphabetsSpaces, restrictAlphanumeric, restrictNumbers, preventManualTyping,
  pasteAlphabetsSpaces, pasteAlphanumeric, pasteNumbers, trimData, regexPatterns,
  getTodayDateString, validatePastDate
} from '../../utils/validationUtils';

const EditVehicle = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { showModal } = useModal();
  const { getVehicle, updateVehicle, checkDuplicateVehicle } = useCustomer();
  const { resources } = useResource();
  const { vehicleTypes } = useVehicleType();
  const { deviceModels } = useDeviceModel();
  const { imeis } = useImei();
  const { sims } = useSim();

  const activeResources = resources.filter(r => r.status === 'Active');
  const activeVehicleTypes = vehicleTypes.filter(vt => vt.status === 'Active');
  const activeImeis = imeis.filter(i => i.status === 'Active' || i.status === 'Available' || !i.status);
  const activeSims = sims.filter(s => s.status === 'Active' || s.status === 'Available' || !s.status);
  
  const [vehicle, setVehicle] = useState(null);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors, dirtyFields } } = useForm({
    mode: 'onChange'
  });

  const currentDeviceModel = useWatch({ control, name: 'deviceModel' });
  const displayDeviceModels = useMemo(() => {
    const active = deviceModels.filter(m => m.status === 'Active');
    if (currentDeviceModel && !active.some(m => m.name === currentDeviceModel)) {
      return [...active, { id: 'legacy', name: currentDeviceModel }];
    }
    return active;
  }, [deviceModels, currentDeviceModel]);

  const currentImei = useWatch({ control, name: 'imei' });
  const displayImeis = useMemo(() => {
    if (currentImei && !activeImeis.some(i => i.imeiNo === currentImei)) {
      return [...activeImeis, { id: 'legacy-imei', imeiNo: currentImei }];
    }
    return activeImeis;
  }, [activeImeis, currentImei]);

  const currentSim = useWatch({ control, name: 'simNumber' });
  const displaySims = useMemo(() => {
    if (currentSim && !activeSims.some(s => s.simNo === currentSim)) {
      return [...activeSims, { id: 'legacy-sim', simNo: currentSim }];
    }
    return activeSims;
  }, [activeSims, currentSim]);

  const currentClosureBy = watch('leadClosureBy');
  const currentVehicleType = watch('vehicleType');
  const hasInactiveSelected = currentClosureBy && !activeResources.some(r => r.employeeName === currentClosureBy);
  const hasInactiveVehicleTypeSelected = currentVehicleType && !activeVehicleTypes.some(vt => vt.name === currentVehicleType);

  const totalSaleAmount = useWatch({ control, name: 'totalSaleAmount', defaultValue: 0 });
  const deviceAmount = useWatch({ control, name: 'deviceAmount', defaultValue: 0 });
  const simAmount = useWatch({ control, name: 'simAmount', defaultValue: 0 });
  const softwareAmount = useWatch({ control, name: 'softwareAmount', defaultValue: 0 });
  const technicianAmount = useWatch({ control, name: 'technicianAmount', defaultValue: 0 });
  const courierAmount = useWatch({ control, name: 'courierAmount', defaultValue: 0 });
  const amountPaid = useWatch({ control, name: 'amountPaid', defaultValue: 0 });
  const installDate = useWatch({ control, name: 'installDate' });
  const validity = useWatch({ control, name: 'validity', defaultValue: 0 });

  useEffect(() => {
    const data = getVehicle(vehicleId);
    if (data) {
      setVehicle(data);
      reset({
        vehicleNo: data.vehicleNo || '',
        platform: data.platform || '',
        vehicleType: data.vehicleType || '',
        imei: data.imei || '',
        simNumber: data.simNumber || '',
        deviceModel: data.deviceModel || '',
        totalSaleAmount: data.totalSaleAmount || data.totalAmount || 0,
        deviceAmount: data.deviceAmount || data.deviceCharge || 0,
        simAmount: data.simAmount || data.simCharge || 0,
        softwareAmount: data.softwareAmount || data.softwareCharge || 0,
        technicianAmount: data.technicianAmount || data.technicianCharge || 0,
        courierAmount: data.courierAmount || data.courierCharge || 0,
        amountPaid: data.amountPaid || 0,
        transactionId: data.transactionId || data.transactionRefNo || data.transactionid || '',
        paymentMode: data.paymentMode || '',
        installPerson: data.installPerson || '',
        leadClosureBy: data.leadClosureBy || '',
        installDate: data.installDate || '',
        validity: data.validity || '12 Months',
      });
    } else {
      navigate('/customers');
    }
  }, [vehicleId, getVehicle, navigate, reset]);

  // Auto Calculations
  const parseNum = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    const totalAmount = parseNum(deviceAmount) + parseNum(simAmount) + parseNum(softwareAmount) + parseNum(technicianAmount) + parseNum(courierAmount);
    setValue('totalAmount', totalAmount);
    
    if (parseNum(totalSaleAmount) === totalAmount) {
      const pendingAmount = totalAmount - parseNum(amountPaid);
      setValue('pendingAmount', pendingAmount > 0 ? pendingAmount : 0);
    } else {
      setValue('pendingAmount', 0);
    }
  }, [totalSaleAmount, deviceAmount, simAmount, softwareAmount, technicianAmount, courierAmount, amountPaid, setValue]);

  useEffect(() => {
    if (installDate && validity) {
      const d = new Date(installDate);
      if (!isNaN(d.getTime())) {
        if (validity === '1 Month') d.setMonth(d.getMonth() + 1);
        else if (validity === '3 Months') d.setMonth(d.getMonth() + 3);
        else if (validity === '6 Months') d.setMonth(d.getMonth() + 6);
        else if (validity === '12 Months' || validity === '12 months' || validity === '1 Year') d.setFullYear(d.getFullYear() + 1);
        else d.setMonth(d.getMonth() + parseInt(validity));
        setValue('expiryDate', d.toISOString().split('T')[0]);
      }
    }
  }, [installDate, validity, setValue]);

  const onSubmit = async (data) => {
    const trimmedData = trimData(data);

    // Validate uniqueness, excluding the current vehicle
    if (checkDuplicateVehicle('vehicleNo', trimmedData.vehicleNo, vehicleId)) {
      showModal({ type: 'error', title: 'Duplicate Found', message: `Vehicle Number "${trimmedData.vehicleNo}" is already registered.` });
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
      if (!isNaN(d.getTime())) {
        if (trimmedData.validity === '1 Month') d.setMonth(d.getMonth() + 1);
        else if (trimmedData.validity === '3 Months') d.setMonth(d.getMonth() + 3);
        else if (trimmedData.validity === '6 Months') d.setMonth(d.getMonth() + 6);
        else if (trimmedData.validity === '12 Months' || trimmedData.validity === '12 months' || trimmedData.validity === '1 Year') d.setFullYear(d.getFullYear() + 1);
        else d.setMonth(d.getMonth() + parseInt(trimmedData.validity));
        expiryDate = d.toISOString().split('T')[0];
      }
    }

    const payload = {
      ...trimmedData,
      totalAmount: totalAmountNum,
      pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
      expiryDate
    };

    await updateVehicle(vehicleId, payload);
    showModal({
      type: 'success',
      title: 'Success',
      message: 'Vehicle updated successfully',
      buttons: [
        { text: 'View Owner', style: 'primary', onClick: () => navigate(`/customers/edit/${vehicle.customerId}`) },
        { text: 'Close', style: 'secondary' }
      ]
    });
  };

  const InputLabel = ({ label, required, isAuto }) => (
    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>} {isAuto && <span className="text-blue-500 font-normal italic">- Auto</span>}
    </label>
  );

  const ErrorMsg = ({ error }) => {
    if (!error) return null;
    return <p className="text-red-500 text-xs mt-1">{error.message}</p>;
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200";
    if (errors[fieldName]) return `${baseClass} border-red-500 dark:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20`;
    if (dirtyFields[fieldName] && !errors[fieldName] && watch(fieldName)) return `${baseClass} border-green-500 dark:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20`;
    return `${baseClass} border-gray-200 focus:ring-blue-500`;
  };

  if (!vehicle) return null;

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 max-w-[1400px] mx-auto w-full bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm transition-colors duration-200">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Edit Vehicle</h2>
          <button 
            onClick={() => navigate(`/customers/edit/${vehicle.customerId}`)}
            className="bg-[#3498db] hover:bg-[#2980b9] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm"
          >
            Back to Owner
          </button>
        </div>

        {/* Main Form Wrapper */}
        <div className="max-w-[1400px] mx-auto w-full space-y-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Section 2: Vehicle Details */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 sm:p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-200 mb-6">
              <div className="flex items-center mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mr-3">2</div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Vehicle Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <InputLabel label="Vehicle Number" required />
                  <input 
                    type="text" 
                    {...register('vehicleNo', { 
                      required: 'Vehicle Number is required',
                      pattern: { 
                        value: /^(TN\d{2}[A-Z]{2}\d{4}|TN\d{2}[A-Z]\d{4}|TN\d{2}\d{4})$/, 
                        message: 'Enter valid Vehicle Number' 
                      }
                    })}
                    onInput={(e) => e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')}
                    className={getInputClass('vehicleNo')}
                  />
                  <ErrorMsg error={errors.vehicleNo} />
                </div>
                <div>
                  <InputLabel label="Platform" required />
                  <select 
                    {...register('platform', { required: 'Platform is required' })}
                    className={getInputClass('platform')}
                  >
                    <option value="">Select Platform</option>
                    <option value="Tracco">Tracco</option>
                    <option value="EagleIndia">EagleIndia</option>
                    <option value="Trackin">Trackin</option>
                    <option value="GPS Monitor">GPS Monitor</option>
                    <option value="OneQlik">OneQlik</option>
                    <option value="Navi lap">Navi lap</option>
                  </select>
                  <ErrorMsg error={errors.platform} />
                </div>
                <div>
                  <InputLabel label="Vehicle Type" required />
                  <select 
                    {...register('vehicleType', { required: 'Please select Vehicle Type' })}
                    className={getInputClass('vehicleType')}
                  >
                    <option value="">Select Type</option>
                    {hasInactiveVehicleTypeSelected && (
                      <option value={currentVehicleType}>{currentVehicleType}</option>
                    )}
                    {activeVehicleTypes.map(vt => (
                      <option key={vt.id} value={vt.name}>{vt.name}</option>
                    ))}
                  </select>
                  <ErrorMsg error={errors.vehicleType} />
                </div>
                
                <div>
                  <InputLabel label="IMEI Number" required />
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="Enter 15-digit IMEI"
                    {...register('imei', {
                      required: 'IMEI is required',
                      pattern: { value: /^\d{15}$/, message: 'IMEI must be exactly 15 digits' }
                    })}
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('imei')}
                  />
                  <ErrorMsg error={errors.imei} />
                </div>
                <div>
                  <InputLabel label="SIM Number" required />
                  <input
                    type="text"
                    maxLength={13}
                    placeholder="Enter 10 or 13-digit SIM No"
                    {...register('simNumber', {
                      required: 'SIM Number is required',
                      pattern: { value: /^\d{10}$|^\d{13}$/, message: 'SIM number must be 10 or 13 digits' }
                    })}
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('simNumber')}
                  />
                  <ErrorMsg error={errors.simNumber} />
                </div>
                <div>
                  <InputLabel label="Device Model" required />
                  <select 
                    {...register('deviceModel', { required: 'Device Model is required' })}
                    className={getInputClass('deviceModel')}
                  >
                    <option value="">Select Model</option>
                    {displayDeviceModels.map(dm => (
                      <option key={dm.id} value={dm.name}>{dm.name}</option>
                    ))}
                  </select>
                  <ErrorMsg error={errors.deviceModel} />
                </div>
              </div>
            </div>

            {/* Section 3: Financial Details */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 sm:p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-200 mb-6">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold mr-3">3</div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Financial Details</h3>
                </div>
                
                {/* Payment Status Badge */}
                {/* {watch('pendingAmount') <= 0 ? (
                  <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-1.5 rounded-full font-bold flex items-center shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Paid
                  </div>
                ) : (
                  <div className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-4 py-1.5 rounded-full font-bold flex items-center shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                    Pending
                  </div>
                )} */}
              </div>
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <InputLabel label="Payment Mode" required />
                  <select 
                    {...register('paymentMode', { required: 'Payment Mode is required' })}
                    className={getInputClass('paymentMode')}
                  >
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
                  <ErrorMsg error={errors.paymentMode} />
                </div>
                <div>
                  <InputLabel label="Transaction ID (Last 6 Digits)" required />
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
                  <ErrorMsg error={errors.transactionId} />
                </div>
                <div>
                  <InputLabel label="Total Sale Amount (₹)" required />
                  <NumericInput {...register('totalSaleAmount', { 
                      required: 'Total Sale Amount is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className={getInputClass('totalSaleAmount')}
                    defaultToZero 
                  />
                  <ErrorMsg error={errors.totalSaleAmount} />
                </div>
                <div>
                  <InputLabel label="Device Amount (₹)" required />
                  <NumericInput {...register('deviceAmount', { 
                      required: 'Device Amount is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className={getInputClass('deviceAmount')}
                    defaultToZero 
                  />
                  <ErrorMsg error={errors.deviceAmount} />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <InputLabel label="SIM Amount (₹)" required />
                  <NumericInput {...register('simAmount', { 
                      required: 'SIM Amount is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className={getInputClass('simAmount')}
                    defaultToZero 
                  />
                  <ErrorMsg error={errors.simAmount} />
                </div>
                <div>
                  <InputLabel label="Software Amount (₹)" />
                  <NumericInput {...register('softwareAmount', { 
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className={getInputClass('softwareAmount')}
                    defaultToZero 
                  />
                  <ErrorMsg error={errors.softwareAmount} />
                </div>
                <div>
                  <InputLabel label="Technician Amount (₹)" />
                  <NumericInput {...register('technicianAmount', { 
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className={getInputClass('technicianAmount')}
                    defaultToZero 
                  />
                  <ErrorMsg error={errors.technicianAmount} />
                </div>
                <div>
                  <InputLabel label="Courier Amount (₹)" />
                  <NumericInput {...register('courierAmount', { 
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className={getInputClass('courierAmount')}
                    defaultToZero 
                  />
                  <ErrorMsg error={errors.courierAmount} />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <InputLabel label="Total Amount (₹)" isAuto />
                  <input 
                    type="text" 
                    readOnly
                    value={watch('totalAmount') || 0}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm font-bold transition-colors"
                  />
                </div>
                <div>
                  <InputLabel label="Amount Paid (₹)" required />
                  <NumericInput {...register('amountPaid', { 
                      required: 'Amount Paid is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className={getInputClass('amountPaid')}
                    defaultToZero 
                  />
                  <ErrorMsg error={errors.amountPaid} />
                </div>
                <div>
                  <InputLabel label="Pending Amount (₹)" isAuto />
                  <input 
                    type="text" 
                    readOnly
                    value={watch('pendingAmount') || 0}
                    className={`w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-sm font-bold transition-colors cursor-not-allowed ${watch('pendingAmount') > 0 ? 'text-red-500' : 'text-green-600'}`}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Installation Details */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 sm:p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-200 mb-6">
              <div className="flex items-center mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mr-3">4</div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Installation Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <InputLabel label="Installation Person" required />
                  <input 
                    type="text" 
                    {...register('installPerson', { 
                      required: 'Installation Person is required',
                      pattern: { value: regexPatterns.location, message: 'Only alphabets and spaces allowed' }
                    })}
                    onKeyDown={restrictAlphabetsSpaces}
                    onPaste={pasteAlphabetsSpaces}
                    className={getInputClass('installPerson')}
                  />
                  <ErrorMsg error={errors.installPerson} />
                </div>
                <div>
                  <InputLabel label="Lead Closure By" required />
                  <select 
                    {...register('leadClosureBy', { 
                      required: 'Please select Lead Closure Employee'
                    })}
                    className={getInputClass('leadClosureBy')}
                  >
                    <option value="">Select Employee</option>
                    {hasInactiveSelected && (
                      <option value={currentClosureBy}>{currentClosureBy}</option>
                    )}
                    {activeResources.map(resource => (
                      <option key={resource.id} value={resource.employeeName}>
                        {resource.employeeName}
                      </option>
                    ))}
                  </select>
                  <ErrorMsg error={errors.leadClosureBy} />
                </div>
                <div>
                  <InputLabel label="Installation Date" required />
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
                  <ErrorMsg error={errors.installDate} />
                </div>
                <div>
                  <InputLabel label="Validity" required />
                  <select 
                    {...register('validity', { required: 'Validity is required' })}
                    className={getInputClass('validity')}
                  >
                    <option value="">Select</option>
                    <option value="1 Month">1 Month</option>
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
                  <ErrorMsg error={errors.validity} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <InputLabel label="Expiry Date" isAuto />
                  <input 
                    type="date" 
                    {...register('expiryDate')}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm font-semibold transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
              <button 
                type="submit"
                disabled={Object.keys(errors).length > 0 || parseFloat(watch('totalSaleAmount')) !== parseFloat(watch('totalAmount'))}
                className={`w-full sm:w-auto px-10 py-3 rounded text-white font-medium shadow-sm transition-colors text-center ${(Object.keys(errors).length > 0 || parseFloat(watch('totalSaleAmount')) !== parseFloat(watch('totalAmount'))) ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-[#3411b0]'}`}
                style={{ backgroundColor: (Object.keys(errors).length > 0 || parseFloat(watch('totalSaleAmount')) !== parseFloat(watch('totalAmount'))) ? '#9ca3af' : '#4b1bc4' }}
              >
                Update Vehicle
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default EditVehicle;
