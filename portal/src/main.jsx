import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from 'react-router-dom';

// Global error handlers to suppress browser extension errors
window.addEventListener('error', (event) => {
  // Suppress errors from browser extensions (message channel errors)
  const errorMessage = event.message || event.error?.message || '';
  const errorString = String(errorMessage).toLowerCase();
  
  if (errorString.includes('message channel closed') || 
      errorString.includes('asynchronous response') ||
      errorString.includes('listener indicated') ||
      errorString.includes('channel closed before')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Suppress promise rejections from browser extensions
  const errorMessage = event.reason?.message || 
                       (typeof event.reason === 'string' ? event.reason : '') ||
                       String(event.reason || '');
  const errorString = String(errorMessage).toLowerCase();
  
  if (errorString.includes('message channel closed') || 
      errorString.includes('asynchronous response') ||
      errorString.includes('listener indicated') ||
      errorString.includes('channel closed before')) {
    event.preventDefault();
    return false;
  }
  // Log other unhandled rejections for debugging (but not extension errors)
  if (!errorString.includes('message channel') && 
      !errorString.includes('asynchronous response') &&
      !errorString.includes('listener indicated')) {
    console.error('Unhandled promise rejection:', event.reason);
  }
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);