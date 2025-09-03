import React from 'react'
import { Outlet } from 'react-router-dom'
import './App.css'
import Header from './components/layout/header'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  )
}

export default App