import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// These should match your backend AssetType enum
const ASSET_TYPES = [
  'ONT',
  'Router',
  'Splitter',
  'FDH',
  'Switch',
  'CPE',
  'FiberRoll',
];

export default function AssetForm() {
  const [formData, setFormData] = useState({
    serial_number: '',
    model: '',
    asset_type: 'ONT',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { assetId } = useParams(); // For editing

  const isEditMode = Boolean(assetId);

  // If in edit mode, fetch the asset's current data
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      fetch(`/api/inventory-assets/${assetId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            serial_number: data.serial_number,
            model: data.model,
            asset_type: data.asset_type,
            location: data.location,
          });
          setLoading(false);
        })
        .catch((err) => setError(err.message));
    }
  }, [assetId, isEditMode]);

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

    const url = isEditMode
      ? `/api/inventory-assets/${assetId}`
      : '/api/inventory-assets';
    
    const method = isEditMode ? 'PUT' : 'POST';
    
    // For PUT, we only send fields that can be updated.
    // For POST, we send all form data.
    const body = isEditMode 
      ? { model: formData.model, location: formData.location } // Can't change S/N or type
      : formData; 

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.detail || 'Failed to save asset') });
        }
        return res.json();
      })
      .then(() => {
        setLoading(false);
        navigate('/assets'); // Go back to the asset list
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  if (loading && isEditMode) return <p>Loading asset data...</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? 'Edit Asset' : 'Add New Asset'}
      </h2>
      
      {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>}

      <div>
        <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">
          Serial Number
        </label>
        <input
          type="text"
          name="serial_number"
          id="serial_number"
          value={formData.serial_number}
          onChange={handleChange}
          required
          disabled={isEditMode} // Can't change S/N after creation
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
          Model
        </label>
        <input
          type="text"
          name="model"
          id="model"
          value={formData.model}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="asset_type" className="block text-sm font-medium text-gray-700">
          Asset Type
        </label>
        <select
          name="asset_type"
          id="asset_type"
          value={formData.asset_type}
          onChange={handleChange}
          disabled={isEditMode} // Can't change type after creation
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {ASSET_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          name="location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Warehouse A"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => navigate('/assets')}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Saving...' : 'Save Asset'}
        </button>
      </div>
    </form>
  );
}