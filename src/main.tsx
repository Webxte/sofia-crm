
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { Toaster } from "@/components/ui/toaster";

// Get the root element
const rootElement = document.getElementById("root");

// Ensure the root element exists before attempting to render
if (!rootElement) {
  console.error("Root element not found!");
} else {
  const root = createRoot(rootElement);
  
  // Proper provider hierarchy to avoid React context issues
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <HelmetProvider>
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </HelmetProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
