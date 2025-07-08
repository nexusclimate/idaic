import "./index.css";
import React, { useState } from "react";
import Idaic from "./components/idaic";
import PageRouter from "./components/PageRouter";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Idaic 
        onPageChange={setCurrentPage} 
        currentPage={currentPage}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
      />
      <main className="flex-1 bg-gray-50 p-10">
        <PageRouter 
          currentPage={currentPage} 
          isAdminAuthenticated={isAdminAuthenticated}
          setIsAdminAuthenticated={setIsAdminAuthenticated}
        />
      </main>
    </div>
  );
}