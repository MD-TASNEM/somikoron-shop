/**
 * Client-side logging utility
 */

const isDev = import.meta.env.DEV;

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`%c[INFO] ${message}`, 'color: #3b82f6; font-weight: bold;', ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(`%c[WARN] ${message}`, 'color: #f59e0b; font-weight: bold;', ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (isDev) {
      console.error(`%c[ERROR] ${message}`, 'color: #ef4444; font-weight: bold;', ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (isDev) {
      console.debug(`%c[DEBUG] ${message}`, 'color: #8b5cf6; font-weight: bold;', ...args);
    }
  }
};
