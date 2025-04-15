import React, { createContext, useContext, useState } from 'react';



export const TabProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('route');
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => useContext(TabContext);
