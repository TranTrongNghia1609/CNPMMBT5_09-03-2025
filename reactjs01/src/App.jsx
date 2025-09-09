import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import './index.css'
import Header from './components/layout/header'

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ['/login', '/register'];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!shouldHideHeader && <Header />}
      <main className={shouldHideHeader ? "w-full h-screen" : "w-full min-h-screen"}>
        <Outlet />
      </main>
    </div>
  )
}

export default App