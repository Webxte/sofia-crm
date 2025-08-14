
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Minimal React setup to test if React loads properly
root.render(
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Minimal React Test</h1>
    <p>Testing basic React functionality</p>
    <button onClick={() => alert('React is working!')}>Test Click</button>
  </div>
);
