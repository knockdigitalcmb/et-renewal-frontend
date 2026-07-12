export const customerService = {
  saveCustomer: async (customerData) => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // console.log("Customer saved via service:", customerData);
        resolve({ success: true, data: customerData });
      }, 500);
    });
  },

  searchExistingCustomers: async (query) => {
    // Mock existing customers
    const mockCustomers = [
      { id: 1, name: 'John Doe', mobile: '9876543210', email: 'john@example.com', location: 'Chennai' },
      { id: 2, name: 'Sathish', mobile: '9629000139', email: 'sathish@example.com', location: 'Coimbatore' }
    ];

    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockCustomers.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.mobile.includes(query)
        );
        resolve({ success: true, data: filtered });
      }, 300);
    });
  }
};
