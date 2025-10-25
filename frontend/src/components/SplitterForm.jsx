import React, { useState } from 'react';

export default function SplitterForm({ fdhId, onSuccess }) {
  const [formData, setFormData] = useState({
    model: '1:32',
    port_capacity: 32,
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Automatically update port_capacity if model is changed
    if (name === 'model') {
      const capacity = value.split(':')[1];
      if (capacity) {
        newFormData.port_capacity = parseInt(capacity);
      }
    }
    setFormData(newFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    fetch('/api/network-hierarchy/splitters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        fdh_id: fdhId, // Link to the parent FDH
        port_capacity: parseInt(formData.port_capacity),
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.detail || 'Failed to create splitter') });
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
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">Splitter Model</label>
        <select
          name="model"
          id="model"
          value={formData.model}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="1:4">1:4</option>
          <option value="1:8">1:8</option>
          <option value="1:16">1:16</option>
          <option value="1:32">1:32</option>
          <option value="1:64">1:64</option>
        </select>
      </div>

      <div>
        <label htmlFor="port_capacity" className="block text-sm font-medium text-gray-700">Port Capacity</label>
        <input
          type="number"
          name="port_capacity"
          id="port_capacity"
          value={formData.port_capacity}
          onChange={handleChange}
          readOnly
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (e.g., Slot 3)</label>
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Create Splitter'}
        </button>
      </div>
    </form>
  );
}