import React, { forwardRef } from 'react';
import { restrictNumbers, pasteNumbers } from '../../utils/validationUtils';

const NumericInput = forwardRef(({ 
  onChange, 
  onBlur, 
  defaultToZero, 
  ...rest 
}, ref) => {
  
  const handleBlur = (e) => {
    let val = e.target.value;
    if (defaultToZero && (val === '' || isNaN(val))) {
      e.target.value = '0';
      if (onChange) {
        onChange(e); // Trigger react-hook-form update
      }
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <input
      type="text"
      ref={ref}
      onKeyDown={restrictNumbers}
      onPaste={pasteNumbers}
      onChange={onChange}
      onBlur={handleBlur}
      {...rest}
    />
  );
});

NumericInput.displayName = 'NumericInput';

export default NumericInput;
