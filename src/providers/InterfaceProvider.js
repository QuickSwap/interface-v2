import { createContext, useContext, useState } from "react";

const uiContext = createContext();

export function UIContextProvider({ children }) {
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  return (
    <uiContext.Provider
      value={{
        walletModalVisible,
        setWalletModalVisible,
      }}
    >
      {children}
    </uiContext.Provider>
  );
}

export const useUIContext = () => useContext(uiContext);
