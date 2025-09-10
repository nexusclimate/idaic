import "./index.css";
import { VERSION } from './config/version.js';
import React, { useState, useEffect } from "react";
import Idaic from "./components/idaic";
import PageRouter from "./components/PageRouter";
import DisclaimerPopup from "./components/DisclaimerPopup";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('idaic-token');
    if (token) {
      setIsAuthenticated(true);
      // Check if user has already accepted the disclaimer
      const disclaimerAccepted = localStorage.getItem('idaic-disclaimer-accepted');
      if (!disclaimerAccepted) {
        setShowDisclaimer(true);
      }
    } else {
      setIsAuthenticated(false);
      window.location.href = '/login.html';
    }
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  const handleDisclaimerAccept = () => {
    localStorage.setItem('idaic-disclaimer-accepted', 'true');
    setShowDisclaimer(false);
  };

  const handleDisclaimerDecline = () => {
    // Clear the token and redirect to login
    localStorage.removeItem('idaic-token');
    window.location.href = '/login.html';
  };

  return (
    <div className="flex h-screen w-screen">
      <DisclaimerPopup 
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
      />
      <Idaic 
        onPageChange={setCurrentPage} 
        currentPage={currentPage}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
      />
      <main className="flex-1 bg-gray-50 p-10 h-full">
        <PageRouter 
          currentPage={currentPage} 
          isAdminAuthenticated={isAdminAuthenticated}
          setIsAdminAuthenticated={setIsAdminAuthenticated}
        />
      </main>
    </div>
  );
}