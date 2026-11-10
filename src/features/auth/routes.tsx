// src/features/auth/routes.tsx (LT4-04)
import type { RouteObject } from 'react-router';
import { LoginPage } from './pages/LoginPage';

export const authPublicRoutes: RouteObject[] = [{ path: '/login', element: <LoginPage /> }];
