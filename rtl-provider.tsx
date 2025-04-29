import React, { createContext, ReactNode, useState, useContext } from "react";

type RTLContextType = {
  isRTL: boolean;
  toggleDirection: () => void;
};

const RTLContext = createContext<RTLContextType | null>(null);

export const RTLProvider = ({ children }: { children: ReactNode }) => {
  // Always start with RTL for Arabic
  const [isRTL, setIsRTL] = useState(true);

  const toggleDirection = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = !isRTL ? "rtl" : "ltr";
  };

  return (
    <RTLContext.Provider value={{ isRTL, toggleDirection }}>
      {children}
    </RTLContext.Provider>
  );
};

export const useRTL = () => {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error("useRTL must be used within a RTLProvider");
  }
  return context;
};
