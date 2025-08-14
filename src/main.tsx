// Completely minimal setup to test React
import React from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Test if React is working at the most basic level
const TestComponent = () => {
  console.log("TestComponent rendering...");
  console.log("React object:", React);
  console.log("React.useState:", React.useState);
  console.log("React.useContext:", React.useContext);
  
  return React.createElement('div', {
    style: { padding: '20px', textAlign: 'center' }
  }, [
    React.createElement('h1', { key: 'h1' }, 'React Module Test'),
    React.createElement('p', { key: 'p' }, 'Checking if React hooks are available'),
    React.createElement('pre', { key: 'pre' }, JSON.stringify({
      hasUseState: typeof React.useState === 'function',
      hasUseContext: typeof React.useContext === 'function',
      hasUseEffect: typeof React.useEffect === 'function',
    }, null, 2))
  ]);
};

const root = createRoot(rootElement);
root.render(React.createElement(TestComponent));