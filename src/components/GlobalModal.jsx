import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const GlobalModal = ({ config, onClose }) => {
  const { type, title, message, buttons } = config;

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Handle outside click
  const handleOutsideClick = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-12 h-12 text-green-500 mb-4" />;
      case 'error':
        return <FiXCircle className="w-12 h-12 text-red-500 mb-4" />;
      case 'warning':
      case 'confirm':
        return <FiAlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />;
      default:
        return <FiInfo className="w-12 h-12 text-blue-500 mb-4" />;
    }
  };

  return (
    <div 
      id="modal-overlay"
      onClick={handleOutsideClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[95%] sm:max-w-[90%] md:max-w-[500px] lg:max-w-[600px] p-6 sm:p-8 transform transition-all animate-in zoom-in-95 duration-200 relative border border-gray-100 dark:border-gray-700">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          {getIcon()}
          
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-8 whitespace-pre-line">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full">
            {buttons && buttons.map((btn, index) => (
              <button
                key={index}
                onClick={() => {
                  if (btn.onClick) btn.onClick();
                  if (btn.autoClose !== false) onClose();
                }}
                className={`px-5 py-2.5 rounded font-medium text-sm transition-colors shadow-sm flex-1 sm:flex-none ${
                  btn.style === 'primary' 
                    ? 'bg-[#4a6cf7] text-white hover:bg-[#3a5bd9]' 
                  : btn.style === 'danger'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                  : btn.style === 'success'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {btn.text}
              </button>
            ))}
            
            {(!buttons || buttons.length === 0) && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalModal;
