import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';
import { logger } from './lib/logger';

// Global axios interceptors for logging
axios.interceptors.request.use(
  (config) => {
    logger.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    logger.error(`[API Request Error]`, error);
    return Promise.reject(error);
  }
);

// Global axios interceptor to handle warmup page HTML responses
axios.interceptors.response.use(
  (response) => {
    logger.debug(`[API Response] ${response.status} ${response.config.url}`, response.data || '');
    // If we get HTML but expected JSON (e.g. from an API route)
    if (
      response.config.url.includes('/api/') &&
      typeof response.data === 'string' &&
      response.data.includes('<!doctype html>') &&
      response.data.includes('Please wait while your application starts')
    ) {
      // This is the warmup page. Reject with a custom error so components can handle it.
      const error = new Error('Server is starting up. Please wait.');
      error.isWarmup = true;
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    logger.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
