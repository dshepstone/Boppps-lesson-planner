import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const LogoContext = createContext();

// Custom hook to use the logo context
export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

// Provider component
export const LogoProvider = ({ children }) => {
  const [logo, setLogo] = useState(null);
  const [logoName, setLogoName] = useState('');
  const [logoSize, setLogoSize] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');

  // Load saved logo on provider mount
  useEffect(() => {
    const savedLogo = sessionStorage.getItem('schoolLogo');
    const savedLogoName = sessionStorage.getItem('schoolLogoName');
    const savedLogoSize = sessionStorage.getItem('schoolLogoSize');
    
    if (savedLogo) {
      setLogo(savedLogo);
      setLogoName(savedLogoName || 'Unknown');
      setLogoSize(parseInt(savedLogoSize) || 0);
    }
  }, []);

  // Save logo to session storage
  const saveLogo = (logoData, name, size) => {
    try {
      sessionStorage.setItem('schoolLogo', logoData);
      sessionStorage.setItem('schoolLogoName', name);
      sessionStorage.setItem('schoolLogoSize', size.toString());
      
      setLogo(logoData);
      setLogoName(name);
      setLogoSize(size);
      setSaveStatus('saved');
      
      setTimeout(() => setSaveStatus(''), 2000);
      return true;
    } catch (error) {
      console.error('Error saving logo:', error);
      return false;
    }
  };

  // Remove logo from session storage
  const removeLogo = () => {
    sessionStorage.removeItem('schoolLogo');
    sessionStorage.removeItem('schoolLogoName');
    sessionStorage.removeItem('schoolLogoSize');
    
    setLogo(null);
    setLogoName('');
    setLogoSize(0);
    setSaveStatus('removed');
    
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Get logo HTML for exports
  const getLogoHtml = (className = 'logo') => {
    if (!logo) return '';
    return `<img src="${logo}" alt="School Logo" class="${className}" style="max-height: 80px; margin-bottom: 10px;" />`;
  };

  // Check if logo exists
  const hasLogo = Boolean(logo);

  const value = {
    logo,
    logoName,
    logoSize,
    saveStatus,
    setSaveStatus,
    saveLogo,
    removeLogo,
    getLogoHtml,
    hasLogo
  };

  return (
    <LogoContext.Provider value={value}>
      {children}
    </LogoContext.Provider>
  );
};