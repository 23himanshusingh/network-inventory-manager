import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const Icon = ({ name }) => <span className="mr-2 w-5 h-5">{name[0]}</span>

const navLinks = [
  { name: 'Dashboard', href: '/', icon: 'D' },
  { name: 'Customers', href: '/customers', icon: 'C' },
  { name: 'Assets', href: '/assets', icon: 'A' },
  { name: 'Network', href: '/network-hierarchy', icon: 'N' },
  { name: 'Topology', href: '/topology', icon: 'V' }, // New Topology Link
  { name: 'Tasks', href: '/tasks', icon: 'T' },
];

// New Search Component
const TopologySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('customer_id');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    // Navigate to the topology page with the correct query param
    navigate(`/topology?${searchType}=${searchTerm}`);
    setSearchTerm('');
  };

  return (
    <form onSubmit={handleSearch} className="p-2">
      <label className="text-xs font-medium text-gray-400">Search Topology</label>
      <div className="flex flex-col space-y-1 mt-1">
        <select 
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="bg-gray-700 text-white text-sm rounded-md p-1 border border-gray-600"
        >
          <option value="customer_id">Customer ID</option>
          <option value="fdh_id">FDH ID</option>
          <option value="asset_serial">Asset Serial</option>
        </select>
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter ID or Serial..."
          className="bg-gray-900 text-white text-sm rounded-md p-1 border border-gray-600"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white text-sm font-medium rounded-md p-1 hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </form>
  );
};


export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="text-xl font-bold p-4 border-b border-gray-700">
          NetInventory
        </div>

        {/* New Search Bar */}
        <TopologySearch />

        <div className="border-b border-gray-700 mx-2"></div>

        <nav className="flex-1 p-2 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
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
        {/* ... (Header is unchanged) ... */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
