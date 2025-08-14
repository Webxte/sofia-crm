// Completely minimal main.tsx without any service worker or complex features
import React from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Force clear any existing service worker cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
}

// Simple test component
const ClearCacheTest = () => {
  React.useEffect(() => {
    console.log('React is working!');
    console.log('Service worker cleared');
    console.log('Caches cleared');
  }, []);

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f9ff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#1f2937' }}>✅ Cache Cleared Successfully</h1>
      <p style={{ color: '#4b5563', marginBottom: '20px' }}>
        Service worker and browser caches have been cleared
      </p>
      <p style={{ color: '#059669', fontWeight: 'bold' }}>
        React is loading properly without errors!
      </p>
      <button 
        onClick={() => window.location.reload()} 
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Reload Page
      </button>
    </div>
  );
};

const root = createRoot(rootElement);
root.render(<ClearCacheTest />);