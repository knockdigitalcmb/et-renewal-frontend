import NumericInput from '../../components/common/NumericInput';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import { useCustomer } from '../../context/CustomerContext';
import { useResource } from '../../context/ResourceContext';
import { useVehicleType } from '../../context/VehicleTypeContext';
import { useDeviceModel } from '../../context/DeviceModelContext';
import { useImei } from '../../context/ImeiContext';
import { useSim } from '../../context/SimContext';
import { useModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import {
  restrictName, restrictAlphabetsSpaces, restrictAlphanumeric, restrictNumbers, preventManualTyping,
  pasteName, pasteAlphabetsSpaces, pasteAlphanumeric, pasteNumbers, trimData, regexPatterns,
  getTodayDateString, validatePastDate
} from '../../utils/validationUtils';

const AddCustomer = () => {
  const navigate = useNavigate();
  const { showModal } = useModal();
  const { addCustomer, addVehicle, updateCustomer, customers, checkDuplicateVehicle, platform, paymentMode, deviceModels, userAll } = useCustomer();
  const { users, fetchUsers } = useResource();
  const { vehicleTypes } = useVehicleType();
  // const { deviceModels } = useDeviceModel();
  const { imeis } = useImei();
  const { sims } = useSim();

  // const activeDeviceModels = deviceModels.filter(m => m.status === 'Active');  
  const activeDeviceModels = deviceModels || [];

  const activeResources = userAll || [];
  const activePlatform = platform || [];
  const activePaymentMode = paymentMode || [];
  const activeVehicleTypes = vehicleTypes.filter(vt => vt.status === 'Active');
  const activeImeis = imeis.filter(i => i.status === 'Active' || i.status === 'Available' || !i.status);
  const activeSims = sims.filter(s => s.status === 'Active' || s.status === 'Available' || !s.status);

  const [notesLength, setNotesLength] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedExistingCustomer, setSelectedExistingCustomer] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      vehicles: [{ vehicleNumber: '', platform: '', vehicleType: '', imeiNumber: '', simNumber: '', deviceModel: '' }],
      deviceCharge: 0,
      simCharge: 0,
      softwareCharge: 0,
      technicianCharge: 0,
      courierCharge: 0,
      totalSaleAmount: 0,
      amountPaid: 0,
      notes: ''
    },
    mode: 'onChange'
  });

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control,
    name: 'vehicles'
  });

  const userNameWatch = useWatch({ control, name: 'UserName' }) || '';
  const deviceCharge = useWatch({ control, name: 'deviceCharge' }) || 0;
  const simCharge = useWatch({ control, name: 'simCharge' }) || 0;
  const softwareCharge = useWatch({ control, name: 'softwareCharge' }) || 0;
  const technicianCharge = useWatch({ control, name: 'technicianCharge' }) || 0;
  const courierCharge = useWatch({ control, name: 'courierCharge' }) || 0;
  const totalSaleAmount = useWatch({ control, name: 'totalSaleAmount' }) || 0;
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
    setValue('location', c.location || '', { shouldValidate: false });
    setShowDropdown(false);
  };

  // Auto Calculations
  const parseNum = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  const totalAmount = parseNum(deviceCharge) + parseNum(simCharge) + parseNum(softwareCharge) + parseNum(technicianCharge) + parseNum(courierCharge);
  const pendingAmount = parseNum(totalSaleAmount) === totalAmount ? totalAmount - parseNum(amountPaid) : 0;

  useEffect(() => {
    setValue('totalAmount', totalAmount);
    setValue('pendingAmount', pendingAmount);
  }, [deviceCharge, simCharge, softwareCharge, technicianCharge, courierCharge, amountPaid, setValue, totalAmount, pendingAmount]);

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
    const vehicles = trimmedData.vehicles || [];

    // Duplicate check for all vehicle numbers in the form
    // for (const v of vehicles) {
    //   if (checkDuplicateVehicle('vehicleNo', v.vehicleNumber)) {
    //     showModal({ type: 'error', title: 'Duplicate Found', message: `Vehicle Number "${v.vehicleNumber}" is already registered.` });
    //     return;
    //   }
    // }

    if (parseNum(trimmedData.totalSaleAmount) !== totalAmount) {
      showModal({ type: 'error', title: 'Validation Error', message: "Total Sale Amount must match Total Amount" });
      return;
    }

    // if (!selectedExistingCustomer) {
    //   const exactMatch = customers.find(c =>
    //     c.name.toLowerCase() === trimmedData.UserName.toLowerCase() &&
    //     c.vehicles?.some(v => vehicles.some(fv => fv.platform === v.platform))
    //   );
    //   if (exactMatch) {
    //     showModal({ type: 'error', title: 'Duplicate Customer', message: 'Existing customer found on this platform. Select from dropdown to add vehicle.' });
    //     return;
    //   }
    // }

    const finalData = { ...trimmedData, totalAmount, pendingAmount };

    // if (selectedExistingCustomer) {
    //   await updateCustomer(selectedExistingCustomer.id, {
    //     altMobile1: trimmedData.altMobile1 || '',
    //     altMobile2: trimmedData.altMobile2 || '',
    //     altMobile3: trimmedData.altMobile3 || '',
    //   });
    //   const sharedFinancial = {
    //     deviceCharge: trimmedData.deviceCharge || 0,
    //     simCharge: trimmedData.simCharge || 0,
    //     softwareCharge: trimmedData.softwareCharge || 0,
    //     technicianCharge: trimmedData.technicianCharge || 0,
    //     courierCharge: trimmedData.courierCharge || 0,
    //     totalSaleAmount: parseNum(trimmedData.totalSaleAmount) || 0,
    //     totalAmount: totalAmount || 0,
    //     transactionRefNo: trimmedData.transactionRefNo || '',
    //     amountPaid: trimmedData.amountPaid || 0,
    //     pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
    //     paymentMode: trimmedData.paymentMode || '',
    //     installPerson: trimmedData.installationPerson || '',
    //     leadClosureBy: trimmedData.leadClosureBy || '-',
    //     installDate: trimmedData.installationDate || '-',
    //     validity: trimmedData.validity || '12',
    //     expiryDate: trimmedData.expiryDate || '-'
    //   };
    //   for (const v of vehicles) {
    //     await addVehicle(selectedExistingCustomer.id, {
    //       vehicleNo: v.vehicleNumber || '-',
    //       platform: v.platform || '',
    //       vehicleType: v.vehicleType || '',
    //       imei: v.imeiNumber || '',
    //       simNumber: v.simNumber || '',
    //       deviceModel: v.deviceModel || '',
    //       ...sharedFinancial
    //     });
    //   }
    //   showModal({
    //     type: 'success', title: 'Success',
    //     message: `${vehicles.length} vehicle(s) added to existing customer!`,
    //     buttons: [
    //       { text: 'View Customer', style: 'primary', onClick: () => navigate(`/customers/edit/${selectedExistingCustomer.id}`) },
    //       { text: 'Add Another', onClick: () => handleReset() },
    //       { text: 'Close', style: 'secondary' }
    //     ]
    //   });
    //   return;
    // }

    const res = await addCustomer(finalData);
    if (res.success) {
      showModal({
        type: 'success', title: 'Success',
        message: `Customer & ${vehicles.length} vehicle(s) saved successfully!`,
        buttons: [
          { text: 'View Customers', style: 'primary', onClick: () => navigate('/customers') },
          { text: 'Add Another', onClick: () => handleReset() },
          { text: 'Close', style: 'secondary' }
        ]
      });
    } else {
      showModal({
        type: 'error',
        title: 'Error',
        message: res.message || 'Failed to add customer',
        buttons: [
          { text: 'Close' }
        ]
      });
    }
  };

  const onError = (errors) => {
    const errorMessages = Object.values(errors).map(e => e.message).filter(Boolean);
    if (errorMessages.length > 0) {
      showModal({ type: 'error', title: 'Validation Error', message: `Please fix the following errors:\n- ${errorMessages.join('\n- ')}` });
    } else {
      showModal({ type: 'error', title: 'Validation Error', message: "Please fill all required fields correctly." });
    }
  };

  const handleReset = () => {
    reset();
    setSelectedExistingCustomer(null);
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

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col p-4 sm:p-8 transition-colors duration-200">

      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-[1400px] mx-auto w-full bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm transition-colors duration-200">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Add New Customer / Vehicle</h2>
        <button
          onClick={() => navigate('/customers')}
          className="bg-[#3498db] hover:bg-[#2980b9] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm"
        >
          Back to List
        </button>
      </div>

      {/* Main Form Wrapper */}
      <div className="max-w-[1400px] mx-auto w-full space-y-6">
        <form onSubmit={handleSubmit(onSubmit, onError)}>

          {/* Section 1: Owner Details */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 sm:p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-200 mb-6 relative" ref={dropdownRef}>
            <div className="flex items-center mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mr-3">1</div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                {selectedExistingCustomer ? <span className="text-[#3498db]">Owner Details (Existing Customer Selected)</span> : 'Owner Details'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative">
                <InputLabel label="Customer Name" required />
                <input
                  type="text"
                  autoComplete="off"
                  {...register('UserName', {
                    required: 'Customer Name is required',
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
                <NumericInput
                  readOnly={!!selectedExistingCustomer}
                  {...register('mobileNumber', {
                    required: 'Mobile is required',
                    pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' }
                  })}
                  className={`${getInputClass('mobileNumber')} ${selectedExistingCustomer ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
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
                  className={`${getInputClass('email')} ${selectedExistingCustomer ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
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
                    pattern: { value: location, message: 'Only alphabets and spaces allowed' }
                  })}
                  onKeyDown={restrictAlphabetsSpaces}
                  onPaste={pasteAlphabetsSpaces}
                  className={`${getInputClass('location')} ${selectedExistingCustomer ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                />
                <ErrorMsg error={errors.location} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div>
                <InputLabel label="Alternate Mobile 1" />
                <NumericInput
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
                <NumericInput
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
                <NumericInput
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

          {/* Section 2: Vehicle Details */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 sm:p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-200 mb-6">
            <div className="flex items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mr-3">2</div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Vehicle Details</h3>
            </div>

            <div className="space-y-6">
              {vehicleFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  {/* Vehicle block header */}
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                      Vehicle {index + 1}
                    </h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeVehicle(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        🗑 Remove Vehicle
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <InputLabel label="Vehicle Number" required />
                      <input
                        type="text"
                        {...register(`vehicles.${index}.vehicleNumber`, {
                          required: 'Vehicle Number is required',
                          pattern: { value: regexPatterns.vehicleNumber, message: 'Enter valid Vehicle Number' }
                        })}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/\s/g, '').replace(/[^A-Z0-9]/g, '');
                          setValue(`vehicles.${index}.vehicleNumber`, val, { shouldValidate: true, shouldDirty: true });
                        }}
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${errors.vehicles?.[index]?.vehicleNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                          }`}
                      />
                      {errors.vehicles?.[index]?.vehicleNumber && <p className="text-red-500 text-xs mt-1">{errors.vehicles[index].vehicleNumber.message}</p>}
                    </div>
                    <div>
                      <InputLabel label="Platform" required />
                      <select
                        {...register(`vehicles.${index}.platform`, { required: 'Platform is required' })}
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${errors.vehicles?.[index]?.platform ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                          }`}
                      >
                        <option value="">Select Platform</option>
                        {activePlatform.map(pv => (
                          <option key={pv.id} value={pv.id}>
                            {pv.platformName}
                          </option>
                        ))}

                      </select>
                      {errors.vehicles?.[index]?.platform && <p className="text-red-500 text-xs mt-1">{errors.vehicles[index].platform.message}</p>}
                    </div>
                    <div>
                      <InputLabel label="Vehicle Type" required />
                      <select
                        {...register(`vehicles.${index}.vehicleType`, { required: 'Vehicle Type is required' })}
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${errors.vehicles?.[index]?.vehicleType ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                          }`}
                      >
                        <option value="">Select Type</option>
                        {activeVehicleTypes.map(vt => (
                          <option key={vt.id} value={vt.id}>{vt.name}</option>
                        ))}
                      </select>
                      {errors.vehicles?.[index]?.vehicleType && <p className="text-red-500 text-xs mt-1">{errors.vehicles[index].vehicleType.message}</p>}
                    </div>
                    <div>
                      <InputLabel label="IMEI Number" required />
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="Enter 15-digit IMEI"
                        {...register(`vehicles.${index}.imeiNumber`, {
                          required: 'IMEI is required',
                          pattern: { value: /^\d{15}$/, message: 'IMEI must be exactly 15 digits' }
                        })}
                        onKeyDown={restrictNumbers}
                        onPaste={pasteNumbers}
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${errors.vehicles?.[index]?.imeiNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                          }`}
                      />
                      {errors.vehicles?.[index]?.imeiNumber && <p className="text-red-500 text-xs mt-1">{errors.vehicles[index].imeiNumber.message}</p>}
                    </div>
                    <div>
                      <InputLabel label="SIM Number" required />
                      <input
                        type="text"
                        maxLength={13}
                        placeholder="Enter 10 or 13-digit SIM No"
                        {...register(`vehicles.${index}.simNumber`, {
                          required: 'SIM Number is required',
                          pattern: { value: /^\d{10}$|^\d{13}$/, message: 'SIM number must be 10 or 13 digits' }
                        })}
                        onKeyDown={restrictNumbers}
                        onPaste={pasteNumbers}
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${errors.vehicles?.[index]?.simNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                          }`}
                      />
                      {errors.vehicles?.[index]?.simNumber && <p className="text-red-500 text-xs mt-1">{errors.vehicles[index].simNumber.message}</p>}
                    </div>
                    <div>
                      <InputLabel label="Device Model" required />
                      <select
                        {...register(`vehicles.${index}.deviceModel`, { required: 'Device Model is required' })}
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${errors.vehicles?.[index]?.deviceModel ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                          }`}
                      >
                        <option value="">Select Model</option>
                        {activeDeviceModels.map(dm => (
                          <option key={dm.id} value={dm.id}>{dm.name}</option>
                        ))}
                      </select>
                      {errors.vehicles?.[index]?.deviceModel && <p className="text-red-500 text-xs mt-1">{errors.vehicles[index].deviceModel.message}</p>}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Vehicle Button */}
              <button
                type="button"
                onClick={() => appendVehicle({ vehicleNumber: '', platform: '', vehicleType: '', imeiNumber: '', simNumber: '', deviceModel: '' })}
                className="w-full border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 rounded-lg py-3 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                + Add Vehicle
              </button>
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
              {/* {pendingAmount <= 0 ? (
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
                  <option value="">Select Payment Mode</option>
                  {activePaymentMode.map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.paymentMode}
                    </option>
                  ))}
                  {/* <option value="">Select Mode</option>
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
                  <option value="CC Payment Gateway">CC Payment Gateway</option> */}
                </select>
                <ErrorMsg error={errors.paymentMode} />
              </div>
              <div>
                <InputLabel label="Transaction Ref No (Last 6 Digits)" required />
                <input
                  type="text"
                  maxLength={6}
                  {...register('transactionRefNo', {
                    required: 'Transaction Ref No is required',
                    pattern: { value: /^\d{6}$/, message: 'Please enter exactly 6 digits.' }
                  })}
                  onKeyDown={restrictNumbers}
                  onPaste={pasteNumbers}
                  className={getInputClass('transactionRefNo')}
                  placeholder="e.g. 987654"
                />
                <ErrorMsg error={errors.transactionRefNo} />
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
                <NumericInput {...register('deviceCharge', {
                  required: 'Device Amount is required',
                  min: { value: 0, message: 'Cannot be negative' }
                })}
                  className={getInputClass('deviceCharge')}
                  defaultToZero
                />
                <ErrorMsg error={errors.deviceCharge} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <InputLabel label="SIM Amount (₹)" required />
                <NumericInput {...register('simCharge', {
                  required: 'SIM Amount is required',
                  min: { value: 0, message: 'Cannot be negative' }
                })}
                  className={getInputClass('simCharge')}
                  defaultToZero
                />
                <ErrorMsg error={errors.simCharge} />
              </div>
              <div>
                <InputLabel label="Software Amount (₹)" />
                <NumericInput {...register('softwareCharge', {
                  min: { value: 0, message: 'Cannot be negative' }
                })}
                  className={getInputClass('softwareCharge')}
                  defaultToZero
                />
                <ErrorMsg error={errors.softwareCharge} />
              </div>
              <div>
                <InputLabel label="Technician Amount (₹)" />
                <NumericInput {...register('technicianCharge', {
                  min: { value: 0, message: 'Cannot be negative' }
                })}
                  className={getInputClass('technicianCharge')}
                  defaultToZero
                />
                <ErrorMsg error={errors.technicianCharge} />
              </div>
              <div>
                <InputLabel label="Courier Amount (₹)" />
                <NumericInput {...register('courierCharge', {
                  min: { value: 0, message: 'Cannot be negative' }
                })}
                  className={getInputClass('courierCharge')}
                  defaultToZero
                />
                <ErrorMsg error={errors.courierCharge} />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <InputLabel label="Total Amount (₹)" isAuto />
                <input
                  type="text"
                  readOnly
                  value={totalAmount}
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
                  value={pendingAmount}
                  className={`w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-sm font-bold transition-colors cursor-not-allowed ${pendingAmount > 0 ? 'text-red-500' : 'text-green-600'}`}
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
                    <option key={resource.id} value={resource.id}>
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
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="13">13 Months</option>
                  <option value="14">14 Months</option>
                  <option value="15">15 Months</option>
                  <option value="24">24 Months</option>
                  <option value="27">27 Months</option>
                  <option value="36">36 Months</option>
                  <option value="48">48 Months</option>
                  <option value="60">60 Months</option>
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
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
