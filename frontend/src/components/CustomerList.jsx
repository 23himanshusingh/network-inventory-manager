import React, { useState, useEffect } from 'react'

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch customers from our API
    // The /api prefix will be handled by the Vite proxy
    fetch('/api/customers')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok')
        }
        return res.json()
      })
      .then((data) => {
        setCustomers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Customer Management</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        {loading && <p>Loading customers...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {customers.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <li key={customer.customer_id} className="py-3">
                <h4 className="text-lg font-medium text-blue-700">{customer.name}</h4>
                <p className="text-sm text-gray-600">{customer.address}</p>
                <p className="text-sm text-gray-500">Status: {customer.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
