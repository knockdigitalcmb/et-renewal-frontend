export const resourceService = {
  saveResource: async (resourceData) => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // console.log("Resource saved via service:", resourceData);
        resolve({ success: true, data: { ...resourceData, id: Date.now(), createdAt: new Date().toISOString() } });
      }, 500);
    });
  }
};
