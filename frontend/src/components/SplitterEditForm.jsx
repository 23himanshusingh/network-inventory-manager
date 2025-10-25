import React, { useState } from 'react';

export default function SplitterEditForm({ splitter, fdhList, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    location: splitter.location || '',
    fdh_id: splitter.fdh_id,
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

    const updatePayload = {
      location: formData.location,
      fdh_id: parseInt(formData.fdh_id),
    };

    fetch(`/api/network-hierarchy/splitters/${splitter.splitter_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    })
      .then((res) => {
        if (!res.ok) {
          // Check for the business rule error
          if (res.status === 400) {
            return res.json().then(err => { throw new Error(err.detail) });
          }
          throw new Error('Failed to update splitter');
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

      <div>
        <label htmlFor="fdh_id" className="block text-sm font-medium text-gray-700">Parent FDH</label>
        <select
          name="fdh_id"
          id="fdh_id"
          value={formData.fdh_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Select an FDH</option>
          {fdhList.map((fdh) => (
            <option key={fdh.fdh_id} value={fdh.fdh_id}>
              {fdh.name} ({fdh.location})
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Warning: You can only move a splitter if it has 0 customers.
        </p>
      </div>

      <div className="flex justify-end space-x-2">
         <button
          type="button"
          onClick={onClose}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}