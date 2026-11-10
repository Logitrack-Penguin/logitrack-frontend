import { createContext } from 'react';

export interface ToastApi {
  success(msg: string): void;
  error(msg: string): void;
  warning(msg: string): void;
}

export const ToastContext = createContext<ToastApi | null>(null);
