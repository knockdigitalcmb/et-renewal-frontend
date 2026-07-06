import React, { createContext, useContext, useState } from 'react';

const SimContext = createContext();

export const useSim = () => useContext(SimContext);

export const SimProvider = ({ children }) => {
  const [sims, setSims] = useState([]);

  const addSim = (simData) => {
    return new Promise((resolve, reject) => {
      // Check for duplicates
      const isDuplicate = sims.some(s => s.simNumber === simData.simNumber);
      if (isDuplicate) {
        reject(new Error('This SIM Number is already assigned.'));
        return;
      }
      const newSim = {
        id: Date.now().toString(),
        ...simData,
        createdAt: new Date().toISOString()
      };
      setSims(prev => [newSim, ...prev]);
      resolve({ success: true, sim: newSim });
    });
  };

  const updateSim = (id, simData) => {
    setSims(prev => prev.map(s => s.id === id ? { ...s, ...simData } : s));
  };

  const deleteSim = (id) => {
    setSims(prev => prev.filter(s => s.id !== id));
  };

  return (
    <SimContext.Provider value={{ sims, addSim, updateSim, deleteSim }}>
      {children}
    </SimContext.Provider>
  );
};
