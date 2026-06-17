import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useCustomer } from '../context/CustomerContext';
import { useResource } from '../context/ResourceContext';
import { useNavigate } from 'react-router-dom';
import {
  restrictName, restrictAlphabetsSpaces, restrictAlphanumeric, restrictNumbers, preventManualTyping,
  pasteName, pasteAlphabetsSpaces, pasteAlphanumeric, pasteNumbers, trimData, regexPatterns,
  getTodayDateString, validatePastDate
} from '../utils/validationUtils';

const AddCustomer = () => {
  const navigate = useNavigate();
  const { addCustomer, addVehicle, updateCustomer, customers, checkDuplicateVehicle } = useCustomer();
  const { resources } = useResource();
  const activeResources = resources.filter(r => r.status === 'Active');
  
  const [notesLength, setNotesLength] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedExistingCustomer, setSelectedExistingCustomer] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors, dirtyFields } } = useForm({
    defaultValues: {
      devicePrice: 0,
      simPrice: 0,
      amountPaid: 0,
      notes: ''
    },
    mode: 'onChange' // Enable real-time validation for border colors
  });

  const userNameWatch = useWatch({ control, name: 'UserName' }) || '';
  const devicePrice = useWatch({ control, name: 'devicePrice' }) || 0;
  const simPrice = useWatch({ control, name: 'simPrice' }) || 0;
  const amountPaid = useWatch({ control, name: 'amountPaid' }) || 0;
  const installationDate = useWatch({ control, name: 'installationDate' });
  const validity = useWatch({ control, name: 'validity' });
  const notes = useWatch({ control, name: 'notes' });

  const searchResults = useMemo(() => {
    if (!userNameWatch || selectedExistingCustomer) return [];
    const term = userNameWatch.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(term));
  }, [userNameWatch, customers, selectedExistingCustomer]);

  useEffect(() => {
    if (selectedExistingCustomer && userNameWatch !== selectedExistingCustomer.name) {
      setSelectedExistingCustomer(null);
    }
    if (!selectedExistingCustomer && userNameWatch && searchResults.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [userNameWatch, selectedExistingCustomer, searchResults.length]);

  const handleSelectCustomer = (c) => {
    setSelectedExistingCustomer(c);
    setValue('UserName', c.name, { shouldValidate: true, shouldDirty: true });
    setValue('mobileNumber', c.mobile, { shouldValidate: true, shouldDirty: true });
    setValue('altMobile1', c.altMobile1 || '', { shouldValidate: true });
    setValue('altMobile2', c.altMobile2 || '', { shouldValidate: true });
    setValue('altMobile3', c.altMobile3 || '', { shouldValidate: true });
    setValue('email', c.email || '', { shouldValidate: true });
    setValue('location', c.location || '', { shouldValidate: true });
    setValue('leadClosureBy', c.leadClosureBy || '', { shouldValidate: true });
    setShowDropdown(false);
  };

  // Auto Calculations
  const totalPaymentReceived = parseFloat(devicePrice) + parseFloat(simPrice);
  const pendingAmount = totalPaymentReceived - parseFloat(amountPaid);

  useEffect(() => {
    setValue('totalPaymentReceived', totalPaymentReceived);
    setValue('pendingAmount', pendingAmount);
  }, [devicePrice, simPrice, amountPaid, setValue, totalPaymentReceived, pendingAmount]);

  useEffect(() => {
    if (installationDate && validity && validity !== 'Select') {
      const date = new Date(installationDate);
      if (!isNaN(date.getTime())) {
        if (validity === '1 Month') date.setMonth(date.getMonth() + 1);
        if (validity === '3 Months') date.setMonth(date.getMonth() + 3);
        if (validity === '6 Months') date.setMonth(date.getMonth() + 6);
        if (validity === '1 Year' || validity === '12 months') date.setFullYear(date.getFullYear() + 1);
        if (validity === '2 Years' || validity === '24 months') date.setFullYear(date.getFullYear() + 2);
        if (validity === '3 Years' || validity === '36 months') date.setFullYear(date.getFullYear() + 3);
        if (validity === '13 months') date.setMonth(date.getMonth() + 13);
        if (validity === '14 months') date.setMonth(date.getMonth() + 14);
        if (validity === '15 months') date.setMonth(date.getMonth() + 15);
        if (validity === '27 months') date.setMonth(date.getMonth() + 27);
        if (validity === '48 months') date.setMonth(date.getMonth() + 48);
        if (validity === '60 months') date.setMonth(date.getMonth() + 60);
        
        // Format to dd-mm-yyyy or yyyy-mm-dd for input type="date"
        const formattedDate = date.toISOString().split('T')[0];
        setValue('expiryDate', formattedDate);
      }
    }
  }, [installationDate, validity, setValue]);

  useEffect(() => {
    setNotesLength(notes ? notes.length : 0);
  }, [notes]);

  const onSubmit = async (data) => {
    const trimmedData = trimData(data);
    
    // Validate uniqueness
    if (checkDuplicateVehicle('vehicleNo', trimmedData.vehicleNumber)) {
      alert(`Error: Vehicle Number "${trimmedData.vehicleNumber}" is already registered to another customer.`);
      return;
    }
    if (checkDuplicateVehicle('imei', trimmedData.imeiNumber)) {
      alert(`Error: IMEI Number "${trimmedData.imeiNumber}" is already registered.`);
      return;
    }
    if (checkDuplicateVehicle('simNumber', trimmedData.simNumber)) {
      alert(`Error: SIM Number "${trimmedData.simNumber}" is already registered.`);
      return;
    }

    // Uniqueness Check for new customers
    if (!selectedExistingCustomer) {
      const exactMatch = customers.find(c => c.name.toLowerCase() === trimmedData.UserName.toLowerCase());
      if (exactMatch) {
        alert("Existing customer found. Select from dropdown to add vehicle.");
        return;
      }
    }

    const finalData = {
      ...trimmedData,
      totalPaymentReceived,
      pendingAmount
    };
    
    // If Existing Customer is selected
    if (selectedExistingCustomer) {
      // Update alternate mobile numbers for the existing customer
      await updateCustomer(selectedExistingCustomer.id, {
        altMobile1: trimmedData.altMobile1 || '',
        altMobile2: trimmedData.altMobile2 || '',
        altMobile3: trimmedData.altMobile3 || '',
      });

      const res = await addVehicle(selectedExistingCustomer.id, {
        vehicleNo: trimmedData.vehicleNumber || '-',
        vehicleType: trimmedData.vehicleType || '',
        imei: trimmedData.imeiNumber || '',
        simNumber: trimmedData.simNumber || '',
        deviceModel: trimmedData.deviceModel || '',
        devicePrice: trimmedData.devicePrice || 0,
        simPrice: trimmedData.simPrice || 0,
        totalPayment: totalPaymentReceived || 0,
        amountPaid: trimmedData.amountPaid || 0,
        pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
        paymentMode: trimmedData.paymentMode || '',
        installPerson: trimmedData.installationPerson || '',
        leadClosureBy: trimmedData.leadClosureBy || '-',
        installDate: trimmedData.installationDate || '-',
        validity: trimmedData.validity || '12',
        expiryDate: trimmedData.expiryDate || '-'
      });
      if (res.success) {
        alert("Vehicle added to existing customer successfully!");
        navigate(`/customers/edit/${selectedExistingCustomer.id}`);
      }
      return;
    }

    const res = await addCustomer(finalData);
    if (res.success) {
      alert("Customer saved successfully!");
      navigate('/customers');
    }
  };

  const onError = (errors) => {
    const errorMessages = Object.values(errors).map(e => e.message).filter(Boolean);
    if (errorMessages.length > 0) {
      alert(`Validation Errors:\n- ${errorMessages.join('\n- ')}`);
    } else {
      alert("Please fill all required fields correctly.");
    }
  };

  const handleReset = () => {
    reset();
    setSelectedExistingCustomer(null);
  };

  const InputLabel = ({ label, required, isAuto }) => (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && '*'} {isAuto && '- Auto'}
    </label>
  );

  const ErrorMsg = ({ error }) => {
    if (!error) return null;
    return <p className="text-red-500 text-xs mt-1">{error.message}</p>;
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-colors";
    if (errors[fieldName]) return `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`;
    if (dirtyFields[fieldName] && !errors[fieldName] && watch(fieldName)) return `${baseClass} border-green-500 focus:ring-green-500 bg-green-50`;
    return `${baseClass} border-gray-200 focus:ring-blue-500`;
  };

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col p-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-[1400px] mx-auto w-full bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">Add New Customer / Vehicle</h2>
        <button 
          onClick={() => navigate('/customers')}
          className="bg-[#3498db] hover:bg-[#2980b9] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm"
        >
          Back to List
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-md shadow-sm max-w-[1400px] mx-auto w-full p-8 border border-gray-100">
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          
          {/* Owner Details */}
          <div className="mb-8 relative" ref={dropdownRef}>
            <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {selectedExistingCustomer ? (
                <span className="text-[#3498db]">Owner Details (Existing Customer Selected)</span>
              ) : (
                'Owner Details'
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative">
                <InputLabel label="User Name" required />
                <input 
                  type="text" 
                  autoComplete="off"
                  {...register('UserName', { 
                    required: 'User Name is required',
                    minLength: { value: 3, message: 'Minimum 3 characters required' },
                    pattern: { value: regexPatterns.UserName, message: 'Only alphabets, numbers, space and dot allowed' }
                  })}
                  onKeyDown={restrictName}
                  onPaste={pasteName}
                  className={getInputClass('UserName')} 
                />
                
                {/* Auto Search Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => handleSelectCustomer(c)}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-0"
                      >
                        <div className="font-semibold text-sm text-gray-800">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.mobile}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <ErrorMsg error={errors.UserName} />
              </div>
              <div>
                <InputLabel label="Primary Mobile" required />
                <input 
                  type="text" 
                  readOnly={!!selectedExistingCustomer}
                  {...register('mobileNumber', { 
                    required: 'Mobile is required',
                    pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' }
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={`${getInputClass('mobileNumber')} ${selectedExistingCustomer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <ErrorMsg error={errors.mobileNumber} />
              </div>
              <div>
                <InputLabel label="Email" />
                <input 
                  type="email" 
                  readOnly={!!selectedExistingCustomer}
                  {...register('email', {
                    pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Invalid email format' }
                  })}
                  className={`${getInputClass('email')} ${selectedExistingCustomer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <ErrorMsg error={errors.email} />
              </div>
              <div>
                <InputLabel label="Location" required />
                <input 
                  type="text" 
                  readOnly={!!selectedExistingCustomer}
                  {...register('location', { 
                    required: 'Location is required',
                    pattern: { value: regexPatterns.location, message: 'Only alphabets and spaces allowed' }
                  })}
                  onKeyDown={restrictAlphabetsSpaces}
                  onPaste={pasteAlphabetsSpaces}
                  className={`${getInputClass('location')} ${selectedExistingCustomer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <ErrorMsg error={errors.location} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div>
                <InputLabel label="Alternate Mobile 1" />
                <input 
                  type="text" 
                  {...register('altMobile1', { 
                    pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' },
                    validate: (value) => !value || value !== watch('mobileNumber') || 'Cannot match Primary Mobile'
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={getInputClass('altMobile1')}
                />
                <ErrorMsg error={errors.altMobile1} />
              </div>
              <div>
                <InputLabel label="Alternate Mobile 2" />
                <input 
                  type="text" 
                  {...register('altMobile2', { 
                    pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' },
                    validate: (value) => {
                      if (!value) return true;
                      if (value === watch('mobileNumber')) return 'Cannot match Primary Mobile';
                      if (value === watch('altMobile1')) return 'Cannot match Alternate Mobile 1';
                      return true;
                    }
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={getInputClass('altMobile2')}
                />
                <ErrorMsg error={errors.altMobile2} />
              </div>
              <div>
                <InputLabel label="Alternate Mobile 3" />
                <input 
                  type="text" 
                  {...register('altMobile3', { 
                    pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' },
                    validate: (value) => {
                      if (!value) return true;
                      if (value === watch('mobileNumber')) return 'Cannot match Primary Mobile';
                      if (value === watch('altMobile1')) return 'Cannot match Alternate Mobile 1';
                      if (value === watch('altMobile2')) return 'Cannot match Alternate Mobile 2';
                      return true;
                    }
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={getInputClass('altMobile3')}
                />
                <ErrorMsg error={errors.altMobile3} />
              </div>
            </div>
          </div>

          {/* Vehicle & Financial Details */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Vehicle & Financial Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <InputLabel label="Vehicle Number" required />
                <input 
                  type="text" 
                  {...register('vehicleNumber', { 
                    required: 'Vehicle Number is required',
                    pattern: { value: regexPatterns.vehicleNumber, message: 'Only alphabets and numbers allowed' }
                  })}
                  onKeyDown={restrictAlphanumeric}
                  onPaste={pasteAlphanumeric}
                  className={getInputClass('vehicleNumber')}
                />
                <ErrorMsg error={errors.vehicleNumber} />
              </div>
              <div>
                <InputLabel label="Vehicle Type" required />
                <input 
                  type="text" 
                  {...register('vehicleType', { 
                    required: 'Vehicle Type is required',
                    pattern: { value: regexPatterns.location, message: 'Only alphabets and spaces allowed' }
                  })}
                  onKeyDown={restrictAlphabetsSpaces}
                  onPaste={pasteAlphabetsSpaces}
                  className={getInputClass('vehicleType')}
                />
                <ErrorMsg error={errors.vehicleType} />
              </div>
              <div>
                <InputLabel label="IMEI Number" required />
                <input 
                  type="text" 
                  {...register('imeiNumber', { 
                    required: 'IMEI is required',
                    pattern: { value: regexPatterns.imei, message: 'Must be exactly 15 digits' }
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={getInputClass('imeiNumber')}
                />
                <ErrorMsg error={errors.imeiNumber} />
              </div>
              <div>
                <InputLabel label="SIM Number" required />
                <input 
                  type="text" 
                  {...register('simNumber', { 
                    required: 'SIM Number is required',
                    pattern: { value: regexPatterns.sim, message: 'Must be 10 or 13 digits' }
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={getInputClass('simNumber')}
                />
                <ErrorMsg error={errors.simNumber} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <InputLabel label="Device Model" required />
                <input 
                  type="text" 
                  {...register('deviceModel', { 
                    required: 'Device Model is required',
                    pattern: { value: regexPatterns.vehicleNumber, message: 'Only alphabets and numbers allowed' }
                  })}
                  onKeyDown={restrictAlphanumeric}
                  onPaste={pasteAlphanumeric}
                  className={getInputClass('deviceModel')}
                />
                <ErrorMsg error={errors.deviceModel} />
              </div>
              <div>
                <InputLabel label="Device Price (₹)" required />
                <input 
                  type="number" 
                  {...register('devicePrice', { 
                    required: 'Device Price is required',
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={getInputClass('devicePrice')}
                />
                <ErrorMsg error={errors.devicePrice} />
              </div>
              <div>
                <InputLabel label="SIM Price (₹)" required />
                <input 
                  type="number" 
                  {...register('simPrice', { 
                    required: 'SIM Price is required',
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={getInputClass('simPrice')}
                />
                <ErrorMsg error={errors.simPrice} />
              </div>
              <div>
                <InputLabel label="Total Payment Received (₹)" isAuto />
                <input 
                  type="text" 
                  readOnly
                  value={totalPaymentReceived}
                  className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <InputLabel label="Amount Paid (₹)" required />
                <input 
                  type="number" 
                  {...register('amountPaid', { 
                    required: 'Amount Paid is required',
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={getInputClass('amountPaid')}
                />
                <ErrorMsg error={errors.amountPaid} />
              </div>
              <div>
                <InputLabel label="Pending Amount (₹)" isAuto />
                <input 
                  type="text" 
                  readOnly
                  value={pendingAmount}
                  className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm font-semibold"
                />
              </div>
              <div>
                <InputLabel label="Payment Mode" required />
                <select 
                  {...register('paymentMode', { required: 'Payment Mode is required' })}
                  className={getInputClass('paymentMode')}
                >
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
                <ErrorMsg error={errors.paymentMode} />
              </div>
              <div>
                <InputLabel label="Payment Received Date" required />
                <input 
                  type="date" 
                  max={getTodayDateString()}
                  {...register('paymentReceivedDate', { 
                    required: 'Payment Received Date is required',
                    validate: validatePastDate
                  })}
                  onKeyDown={preventManualTyping}
                  className={getInputClass('paymentReceivedDate')}
                />
                <ErrorMsg error={errors.paymentReceivedDate} />
              </div>
            </div>
          </div>

          {/* Installation Details */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Installation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <InputLabel label="Installation Person" required />
                <input 
                  type="text" 
                  {...register('installationPerson', { 
                    required: 'Installation Person is required',
                    pattern: { value: regexPatterns.location, message: 'Only alphabets and spaces allowed' }
                  })}
                  onKeyDown={restrictAlphabetsSpaces}
                  onPaste={pasteAlphabetsSpaces}
                  className={getInputClass('installationPerson')}
                />
                <ErrorMsg error={errors.installationPerson} />
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
                  {...register('installationDate', { 
                    required: 'Installation Date is required',
                    validate: validatePastDate
                  })}
                  onKeyDown={preventManualTyping}
                  className={getInputClass('installationDate')}
                />
                <ErrorMsg error={errors.installationDate} />
              </div>
              <div>
                <InputLabel label="Validity" required />
                <select 
                  {...register('validity', { required: 'Validity is required' })}
                  className={getInputClass('validity')}
                >
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
                  className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <InputLabel label="Notes (Max 500 chars)" />
            <textarea 
              {...register('notes', { maxLength: 500 })}
              className={getInputClass('notes') + " min-h-[100px] resize-y"}
            ></textarea>
            <div className="text-right text-xs text-gray-400 mt-1">
              {notesLength} / 500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t border-gray-100 pt-6">
            <button 
              type="submit"
              disabled={Object.keys(errors).length > 0}
              className={`w-full sm:w-auto px-10 py-3 rounded text-white font-medium shadow-sm transition-colors text-center ${Object.keys(errors).length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-[#3411b0]'}`}
              style={{ backgroundColor: Object.keys(errors).length > 0 ? '#9ca3af' : '#4b1bc4' }}
            >
              Save Customer/Vehicle
            </button>
            <button 
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-8 py-3 rounded text-gray-800 font-medium shadow-sm transition-colors text-center"
              style={{ backgroundColor: '#f1c40f' }}
            >
              Reset Form
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
