import React, { createContext, useContext, useState, useCallback } from 'react';
import GlobalModal from '../components/common/Modal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState(null);

  const showModal = useCallback(({ type, title, message, buttons }) => {
    setModalConfig({ type, title, message, buttons });
  }, []);

  const hideModal = useCallback(() => {
    setModalConfig(null);
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalConfig && <GlobalModal config={modalConfig} onClose={hideModal} />}
    </ModalContext.Provider>
  );
};
