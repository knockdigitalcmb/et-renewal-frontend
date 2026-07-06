import React, { createContext, useContext, useState } from 'react';

const ResourceContext = createContext();

export const useResource = () => useContext(ResourceContext);

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResource = async (data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newResource = { ...data, id: Date.now(), status: 'Active' };
        setResources(prev => [newResource, ...prev]);
        setIsLoading(false);
        resolve({ success: true });
      }, 500);
    });
  };

  const updateResource = async (id, data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setResources(prev => prev.map(res => res.id === parseInt(id) ? { ...res, ...data } : res));
        setIsLoading(false);
        resolve({ success: true });
      }, 500);
    });
  };

  const deleteResource = async (id) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setResources(prev => prev.filter(res => res.id !== parseInt(id)));
        setIsLoading(false);
        resolve({ success: true });
      }, 500);
    });
  };

  const getResource = (id) => {
    return resources.find(res => res.id === parseInt(id));
  };

  return (
    <ResourceContext.Provider value={{ resources, addResource, updateResource, deleteResource, getResource, isLoading }}>
      {children}
    </ResourceContext.Provider>
  );
};
