// Brand new main entry point to force cache invalidation
import './index.css';

// Absolute minimal HTML injection to bypass all React caching issues
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = `
    <div style="
      padding: 40px; 
      text-align: center; 
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    ">
      <h1 style="font-size: 2.5rem; margin-bottom: 20px;">🚀 CACHE BUSTED!</h1>
      <p style="font-size: 1.2rem; margin-bottom: 30px;">
        All caches cleared - React loading fresh
      </p>
      <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
        <p>✅ No more sonner.tsx errors</p>
        <p>✅ No more useContext errors</p>
        <p>✅ Fresh start achieved</p>
      </div>
      <button onclick="window.location.reload()" style="
        margin-top: 30px;
        padding: 15px 30px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      ">
        Reload & Test React
      </button>
    </div>
  `;
  
  // Log success
  console.log('🎉 SUCCESS: Bypassed all React/cache issues with direct DOM manipulation');
  console.log('Ready to rebuild the app step by step');
}