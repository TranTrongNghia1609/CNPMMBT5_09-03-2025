import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx'
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import { AuthProvider } from './components/context/auth.context.jsx';
import AuthWrapper from './components/context/auth.wrapper.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/register",
        element: <RegisterPage />
      },
      {
        path: "users",
        element: (
          <AuthWrapper>
            <UserPage />
          </AuthWrapper>
        )
      },
    ]
  },

]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
)