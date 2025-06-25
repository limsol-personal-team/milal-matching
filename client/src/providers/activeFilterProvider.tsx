import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveFilterContextType {
  showActiveOnly: boolean;
  toggleActiveFilter: () => void;
  setShowActiveOnly: (value: boolean) => void;
}

const ActiveFilterContext = createContext<ActiveFilterContextType | undefined>(undefined);

export const useActiveFilter = () => {
  const context = useContext(ActiveFilterContext);
  if (context === undefined) {
    throw new Error('useActiveFilter must be used within an ActiveFilterProvider');
  }
  return context;
};

interface ActiveFilterProviderProps {
  children: ReactNode;
}

export const ActiveFilterProvider: React.FC<ActiveFilterProviderProps> = ({ children }) => {
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const toggleActiveFilter = () => {
    setShowActiveOnly(prev => !prev);
  };

  const value = {
    showActiveOnly,
    toggleActiveFilter,
    setShowActiveOnly,
  };

  return (
    <ActiveFilterContext.Provider value={value}>
      {children}
    </ActiveFilterContext.Provider>
  );
}; 