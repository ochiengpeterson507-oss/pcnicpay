import { SupabaseProvider } from './components/SupabaseProvider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={new QueryClient()}><SupabaseProvider><App /></SupabaseProvider></QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
