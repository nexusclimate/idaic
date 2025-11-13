import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from 'react-router-dom';

// Global error handlers to suppress browser extension errors
window.addEventListener('error', (event) => {
  // Suppress errors from browser extensions (message channel errors)
  const errorMessage = event.message || event.error?.message || '';
  if (errorMessage.includes('message channel closed') || 
      errorMessage.includes('asynchronous response')) {
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Suppress promise rejections from browser extensions
  const errorMessage = event.reason?.message || 
                       (typeof event.reason === 'string' ? event.reason : '') ||
                       String(event.reason || '');
  
  if (errorMessage.includes('message channel closed') || 
      errorMessage.includes('asynchronous response')) {
    event.preventDefault();
    return false;
  }
  // Log other unhandled rejections for debugging (but not extension errors)
  if (!errorMessage.includes('message channel') && 
      !errorMessage.includes('asynchronous response')) {
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