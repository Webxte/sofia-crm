
import * as React from 'react';

// A simple component to test if React hooks are working properly
export function DebugHooks() {
  const [count, setCount] = React.useState(0);
  const click = React.useCallback(() => setCount((c) => c + 1), []);
  
  return (
    <div className="p-4 m-4 border border-red-500 rounded">
      <p className="text-sm text-gray-500 mb-2">Debug Hooks Test</p>
      <button 
        onClick={click}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Clicked: {count}
      </button>
    </div>
  );
}
