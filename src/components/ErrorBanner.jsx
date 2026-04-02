import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export const ErrorBanner = () => {
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get('/api/debug');
        if (!response.data.dbConnected) {
          // If we get a response but DB is not connected, check the status endpoint
          // which might return the 503 with details
          try {
            await axios.get('/api/products');
          } catch (err) {
            if (err.response?.status === 503) {
              setError(err.response.data);
              setIsVisible(true);
            }
          }
        } else {
          setIsVisible(false);
        }
      } catch (err) {
        // Ignore errors here as they are handled by axios interceptors or other components
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !error) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300">
      <div className="bg-red-600 text-white px-4 py-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-bold">Database Connection Issue</p>
            <p className="opacity-90">{error.message}</p>
            {error.details?.includes('SSL alert number 80') && (
              <div className="mt-2 text-xs bg-red-900/40 p-2 rounded border border-red-400/30">
                <p className="font-semibold mb-1">💡 Potential Fix:</p>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                  <li>Go to <strong>MongoDB Atlas</strong> &gt; <strong>Network Access</strong></li>
                  <li>Add <strong>0.0.0.0/0</strong> to the whitelist</li>
                  <li>Ensure your <strong>MONGODB_URI</strong> is correct in settings</li>
                </ul>
              </div>
            )}
            {!error.details?.includes('SSL alert number 80') && error.details && (
              <p className="text-xs mt-1 font-mono bg-red-700/50 p-1 rounded">
                Error: {error.details}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="p-1.5 hover:bg-red-500 rounded-full transition-colors flex items-center gap-1 text-xs font-medium border border-red-400"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 hover:bg-red-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
