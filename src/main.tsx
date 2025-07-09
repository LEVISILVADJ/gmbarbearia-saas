import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from './lib/pwa.ts';

// Add error boundary and logging
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
  document.body.innerHTML = '<div style="color: white; padding: 20px; background: #111;">Error: Root element not found</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    // Only log in development
    if (import.meta.env.DEV) {
      console.log('App rendered successfully');
    }
    
    // Register service worker
    registerSW();
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = '<div style="color: white; padding: 20px; background: #111;">Error loading application. Check console for details.</div>';
  }
}