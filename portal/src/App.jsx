import "./index.css";
import { VERSION } from './config/version.js';
import React, { useState, useEffect } from "react";
import Idaic from "./components/idaic";
import PageRouter from "./components/PageRouter";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('idaic-token');
    if (token) {
      setIsAuthenticated(true);
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

  return (
    <div className="flex h-screen w-screen">
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