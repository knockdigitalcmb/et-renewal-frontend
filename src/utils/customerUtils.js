export const isExpiringWithin30Days = (dateString) => {
  if (!dateString || dateString === '-' || dateString === 'N/A') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + 30);
  
  const expDate = new Date(dateString);
  return expDate <= targetDate;
};

export const getExpiringCustomers = (customers) => {
  if (!customers || !Array.isArray(customers)) return [];
  
  return customers.filter(customer => {
    // Check if any nested vehicle is expiring
    if (customer.vehicles && Array.isArray(customer.vehicles) && customer.vehicles.length > 0) {
      return customer.vehicles.some(v => isExpiringWithin30Days(v.expiryDate));
    }
    
    // Fallback for flat customer structure
    return isExpiringWithin30Days(customer.expiryDate || customer.renewalDate);
  });
};
