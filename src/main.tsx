import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Simple test component to verify AuthProvider works
const TestApp = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>React + AuthProvider Test</h1>
      <p>Testing if AuthProvider loads without errors</p>
      <p>✅ React is working</p>
      <p>✅ AuthProvider is working</p>
      <button onClick={() => console.log('Button works!')}>Test Button</button>
    </div>
  );
};

const root = createRoot(rootElement);
root.render(
  <AuthProvider>
    <TestApp />
  </AuthProvider>
);