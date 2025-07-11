import "./index.css";
import { VERSION } from './config/version.js';
import React, { useState } from "react";
import Idaic from "./components/idaic";
import PageRouter from "./components/PageRouter";
import { VERSION } from './config/version.js';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

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