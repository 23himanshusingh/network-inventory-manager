import React, { useState } from 'react';

export default function FDHForm({ headendId, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    region: '',
    max_ports: 128,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    fetch('/api/network-hierarchy/fdhs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        headend_id: headendId, // Link to the parent Headend
        max_ports: parseInt(formData.max_ports), // Ensure max_ports is an integer
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.detail || 'Failed to create FDH') });
        }
        return res.json();
      })
      .then(() => {
        setLoading(false);
        onSuccess(); // Close modal and refresh data
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">FDH Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          name="location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700">Region</label>
        <input
          type="text"
          name="region"
          id="region"
          value={formData.region}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="max_ports" className="block text-sm font-medium text-gray-700">Max Ports</label>
        <input
          type="number"
          name="max_ports"
          id="max_ports"
          value={formData.max_ports}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Create FDH'}
        </button>
      </div>
    </form>
  );
}