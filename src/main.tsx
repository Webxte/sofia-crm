// Completely stripped down main.tsx - no external dependencies except React
import * as React from 'react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root using createElement to avoid any JSX issues
const root = React.createElement.bind(null);

// Simple component without hooks
const SimpleTest = () => {
  return React.createElement('div', {
    style: { 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('h1', { key: 'title' }, 'React Basic Test'),
    React.createElement('p', { key: 'desc' }, 'Testing if React loads without external dependencies'),
    React.createElement('button', { 
      key: 'btn',
      onClick: () => console.log('Button clicked - React is working!')
    }, 'Test Button')
  ]);
};

// Use createRoot from react-dom/client
import { createRoot } from 'react-dom/client';
const reactRoot = createRoot(rootElement);
reactRoot.render(React.createElement(SimpleTest));