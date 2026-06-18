export const formatGlobalDate = (dateString, format) => {
  if (!dateString || dateString === '-') return '-';
  
  // Try to parse YYYY-MM-DD
  let d;
  if (dateString.includes('-') && dateString.length === 10) {
    const parts = dateString.split('-');
    if (parts[0].length === 4) {
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      d = new Date(dateString);
    }
  } else {
    d = new Date(dateString);
  }

  if (isNaN(d.getTime())) return dateString;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'MM-DD-YYYY':
      return `${month}-${day}-${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}-${month}-${year}`; // default fallback
  }
};
