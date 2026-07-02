// Input Restriction Validation Utilities

// Helper to block keys that don't match the allowed regex
// We allow control keys like Backspace, Delete, Arrow keys, Tab, etc.
const isControlKey = (e) => {
  return (
    e.ctrlKey || 
    e.metaKey || 
    e.altKey || 
    e.key === 'Backspace' || 
    e.key === 'Delete' || 
    e.key === 'ArrowLeft' || 
    e.key === 'ArrowRight' || 
    e.key === 'ArrowUp' || 
    e.key === 'ArrowDown' || 
    e.key === 'Tab' || 
    e.key === 'Enter' ||
    e.key === 'Home' ||
    e.key === 'End'
  );
};

export const restrictName = (e) => {
  if (isControlKey(e)) return;
  // Allow Alphabets, Numbers, Space, Dot
  if (!/^[A-Za-z0-9. ]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const restrictAlphabetsSpaces = (e) => {
  if (isControlKey(e)) return;
  // Allow only Alphabets and Spaces
  if (!/^[A-Za-z ]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const restrictAlphanumeric = (e) => {
  if (isControlKey(e)) return;
  // Allow only Alphabets and Numbers (No spaces, no symbols)
  if (!/^[A-Za-z0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const restrictNumbers = (e) => {
  if (isControlKey(e)) return;
  // Allow only Numbers
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const preventManualTyping = (e) => {
  if (e.key === 'Tab') return;
  e.preventDefault();
};

// Paste Handlers (strips invalid characters and prevents default if needed)
export const handlePaste = (e, pattern) => {
  e.preventDefault();
  const pasteData = (e.clipboardData || window.clipboardData).getData('text');
  // Remove any character that doesn't match the pattern
  let cleanedData = pasteData.replace(pattern, '');
  
  // Insert the cleaned text at cursor position (fallback approach for standard inputs)
  // Since we use react-hook-form, it's safer to just set the value if we had access to setValue,
  // but natively we can just do document.execCommand
  if (cleanedData) {
    document.execCommand('insertText', false, cleanedData);
  }
};

export const pasteName = (e) => handlePaste(e, /[^A-Za-z0-9. ]/g);
export const pasteAlphabetsSpaces = (e) => handlePaste(e, /[^A-Za-z ]/g);
export const pasteAlphanumeric = (e) => handlePaste(e, /[^A-Za-z0-9]/g);
export const pasteNumbers = (e) => handlePaste(e, /[^0-9]/g);

// Global trim helper for form submission
export const trimData = (data) => {
  const trimmed = {};
  for (const key in data) {
    if (typeof data[key] === 'string') {
      trimmed[key] = data[key].trim();
    } else {
      trimmed[key] = data[key];
    }
  }
  return trimmed;
};

// Regex patterns for react-hook-form validation
export const regexPatterns = {
  customerName: /^[A-Za-z0-9. ]{3,}$/,
  location: /^[A-Za-z ]+$/,
  vehicleNumber: /^(TN\d{2}[A-Z]{2}\d{4}|TN\d{2}[A-Z]\d{4}|TN\d{2}\d{4})$/, // Strict TN format
  imei: /^\d{15}$/,
  mobile: /^\d{10}$/,
  sim: /^(\d{10}|\d{13})$/,
};

// Date utilities
export const getTodayDateString = () => {
  const today = new Date();
  // Adjust for timezone offset to get local YYYY-MM-DD correctly
  const offset = today.getTimezoneOffset() * 60000; 
  return new Date(today.getTime() - offset).toISOString().split('T')[0];
};

export const validatePastDate = (value) => {
  if (!value) return true;
  const selectedDate = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (selectedDate > today) {
    return 'Future dates are not allowed';
  }
  return true;
};
