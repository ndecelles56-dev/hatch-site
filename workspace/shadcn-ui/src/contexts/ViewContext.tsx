import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewMode = 'customer' | 'broker';

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleView: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('broker'); // Default to broker view

  const toggleView = () => {
    setViewMode(prev => prev === 'customer' ? 'broker' : 'customer');
  };

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode, toggleView }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};