import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PrivyProvider } from '@privy-io/react-auth';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      // ...rest of config
    >
      <App />
    </PrivyProvider>
  </StrictMode>
);
