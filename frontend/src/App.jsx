import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

// Dummy icons (replace with a library like Lucide later)
const Icon = ({ name }) => <span className="mr-2 w-5 h-5">{name[0]}</span>

// Data for navigation links
const navLinks = [
  { name: 'Dashboard', href: '/', icon: 'D' },
  { name: 'Customers', href: '/customers', icon: 'C' },
  { name: 'Assets', href: '/assets', icon: 'A' },
  { name: 'Tasks', href: '/tasks', icon: 'T' },
]

export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="text-xl font-bold p-4 border-b border-gray-700">
          NetInventory
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              // This is how NavLink handles active state
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
              // Ensure the root path only matches exactly
              end={link.href === '/'}
            >
              <Icon name={link.name} />
              {link.name}
            </NavLink>
          ))}
        </nav>
        {/* User profile (dummy) */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm">Admin User</div>
          <a href="#" className="text-xs text-red-400 hover:text-red-300">
            Log Out
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (dummy, can be improved) */}
        <header className="bg-white shadow-sm p-4">
          <h1 className="text-2xl font-semibold text-gray-800">Network Dashboard</h1>
        </header>
        
        {/* Page content - this is where child routes render */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}