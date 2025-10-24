import React from 'react'

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dummy Stats Cards */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Customers</h3>
          <p className="text-3xl font-bold">1</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Available Assets</h3>
          <p className="text-3xl font-bold">2</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Pending Tasks</h3>
          <p className="text-3xl font-bold">1</p>
        </div>
      </div>
    </div>
  )
}
