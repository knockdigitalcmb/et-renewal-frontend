import React, { useState, useRef } from 'react';
import NumericInput from '../../components/common/NumericInput';
import Header from '../../components/layout/Header';
import { useModal } from '../../context/ModalContext';
import { useSettings } from '../../context/SettingsContext';
import { useProfile } from '../../context/ProfileContext';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi';

const Profile = () => {
  const { showModal } = useModal();
  const { formatDate } = useSettings();
  const { profile, updateProfile } = useProfile();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);

  const initial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U';

  const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, reset: resetEdit, setValue } = useForm();
  
  const { register: registerPwd, handleSubmit: handleSubmitPwd, formState: { errors: errorsPwd }, reset: resetPwd, watch: watchPwd } = useForm();

  const openEditModal = () => {
    resetEdit({
      fullName: profile.fullName,
      email: profile.email,
      mobileNumber: profile.mobileNumber
    });
    setPreviewImage(profile.profileImage);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setPreviewImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showModal({ type: 'error', title: 'File Too Large', message: 'Profile image must be less than 2MB' });
        return;
      }
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        showModal({ type: 'error', title: 'Invalid Format', message: 'Only JPG, JPEG, and PNG are allowed' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setValue('profileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onEditSubmit = (data) => {
    updateProfile({
      fullName: data.fullName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      profileImage: previewImage || profile.profileImage
    });
    closeEditModal();
    showModal({ type: 'success', title: 'Profile Updated', message: 'Your profile has been updated successfully.' });
  };

  const onPasswordSubmit = (data) => {
    // In a real app, verify current password and hash the new one
    setShowPasswordModal(false);
    resetPwd();
    showModal({ type: 'success', title: 'Password Updated', message: 'Your password has been changed successfully.' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const getInputClass = (error) => `w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`;

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-6 flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-2xl overflow-hidden mt-4 self-start transition-colors duration-200">
          <div className="bg-[#4a6cf7] h-32 w-full relative">
            <div className="absolute top-4 right-4 space-x-3">
              <button 
                onClick={() => { resetPwd(); setShowPasswordModal(true); }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded text-sm transition-colors shadow-sm backdrop-blur-sm"
              >
                Change Password
              </button>
              <button 
                onClick={openEditModal}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-[#4a6cf7] font-medium rounded text-sm transition-colors shadow-sm"
              >
                Edit Profile
              </button>
            </div>
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1 shadow-md z-10">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#3498db] text-white flex items-center justify-center text-4xl font-bold">
                    {initial}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.fullName}</h2>
                <p className="text-sm font-medium text-[#4a6cf7] mt-1">{profile.role}</p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wider">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
                    <p className="text-gray-900 dark:text-white">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mobile Number</p>
                    <p className="text-gray-900 dark:text-white">{profile.mobileNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account Created</p>
                    <p className="text-gray-900 dark:text-white">{formatDate(profile.accountCreatedDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={closeEditModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <FiX size={24} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h3>
            
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FiUpload className="text-gray-400 w-8 h-8" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Upload Image</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-gray-500 mt-2">JPG, JPEG, PNG (Max 2MB)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input 
                  {...registerEdit('fullName', { 
                    required: 'Full Name is required',
                    minLength: { value: 3, message: 'Minimum 3 characters required' },
                    pattern: { value: /^[A-Za-z\s]+$/, message: 'Alphabets and spaces only' }
                  })}
                  className={getInputClass(errorsEdit.fullName)}
                />
                {errorsEdit.fullName && <p className="text-red-500 text-xs mt-1">{errorsEdit.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input 
                  {...registerEdit('email', { 
                    required: 'Email is required',
                    pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Invalid email format' }
                  })}
                  className={getInputClass(errorsEdit.email)}
                />
                {errorsEdit.email && <p className="text-red-500 text-xs mt-1">{errorsEdit.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mobile Number *</label>
                <input 
                  {...registerEdit('mobileNumber', { 
                    required: 'Mobile Number is required',
                    pattern: { value: /^[0-9]{10}$/, message: 'Must be exactly 10 digits' }
                  })}
                  className={getInputClass(errorsEdit.mobileNumber)}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  maxLength={10}
                />
                {errorsEdit.mobileNumber && <p className="text-red-500 text-xs mt-1">{errorsEdit.mobileNumber.message}</p>}
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#4a6cf7] rounded hover:bg-[#3a5bd9] transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => { setShowPasswordModal(false); resetPwd(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <FiX size={24} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h3>
            
            <form onSubmit={handleSubmitPwd(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword.current ? "text" : "password"}
                    {...registerPwd('currentPassword', { required: 'Current Password is required' })}
                    className={getInputClass(errorsPwd.currentPassword)}
                  />
                  <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errorsPwd.currentPassword && <p className="text-red-500 text-xs mt-1">{errorsPwd.currentPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword.new ? "text" : "password"}
                    {...registerPwd('newPassword', { 
                      required: 'New Password is required',
                      pattern: { value: pwdPattern, message: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character' }
                    })}
                    className={getInputClass(errorsPwd.newPassword)}
                  />
                  <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errorsPwd.newPassword && <p className="text-red-500 text-xs mt-1">{errorsPwd.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword.confirm ? "text" : "password"}
                    {...registerPwd('confirmPassword', { 
                      required: 'Please confirm password',
                      validate: val => {
                        if (watchPwd('newPassword') !== val) {
                          return "Passwords do not match";
                        }
                      }
                    })}
                    className={getInputClass(errorsPwd.confirmPassword)}
                  />
                  <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errorsPwd.confirmPassword && <p className="text-red-500 text-xs mt-1">{errorsPwd.confirmPassword.message}</p>}
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowPasswordModal(false); resetPwd(); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#4a6cf7] rounded hover:bg-[#3a5bd9] transition-colors">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
