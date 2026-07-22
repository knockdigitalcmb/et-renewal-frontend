import React, { createContext, useContext, useState, useCallback } from 'react';

const ResourceContext = createContext();

export const useResource = () => useContext(ResourceContext);

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
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
    // return resources.find(res => res.id === parseInt(id));
  };

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch('http://103.235.105.121:3000/api/v1/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const userList = Array.isArray(result.data) ? result.data : [];
        const mappedUsers = userList.map(c => ({
          id: c.id,
          employeeName: c.name || '-'
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ResourceContext.Provider value={{ resources, users, addResource, updateResource, deleteResource, getResource, isLoading, fetchUsers }}>
      {children}
    </ResourceContext.Provider>
  );
};
