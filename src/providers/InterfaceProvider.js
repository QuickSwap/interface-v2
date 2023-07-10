import { createContext, useContext, useRef, useState } from "react";

const uiContext = createContext();

export function UIContextProvider({ children }) {
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  const currentTour = useRef();

  return (
    <uiContext.Provider
      value={{
        walletModalVisible,
        setWalletModalVisible,
        currentTour,
      }}
    >
      {children}
    </uiContext.Provider>
  );
}

export const useUIContext = () => useContext(uiContext);
