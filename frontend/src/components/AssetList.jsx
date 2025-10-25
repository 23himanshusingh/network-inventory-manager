import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

// These should match your backend AssetType and AssetStatus enums
const ASSET_TYPES = ['ONT', 'Router', 'Switch', 'CPE', 'FiberRoll', 'FDH', 'Splitter'];
const ASSET_STATUSES = ['Available', 'Assigned', 'Faulty', 'Retired'];

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    asset_type: '',
    status: '',
    location: '', // Add location state
  });

  const fetchAssets = () => {
    setLoading(true);
    
    // Build query string from filters
    const params = new URLSearchParams();
    if (filters.asset_type) {
      params.append('asset_type', filters.asset_type);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.location) { // Add location to query
      params.append('location', filters.location);
    }
    
    const queryString = params.toString();
    
    fetch(`/api/inventory-assets?${queryString}`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setAssets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Fetch data on initial render and when filters change
  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800">Asset Inventory</h2>
        <Link
          to="/assets/new"
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Add New Asset
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex space-x-4">
        <div>
          <label htmlFor="asset_type" className="block text-sm font-medium text-gray-700">
            Filter by Type
          </label>
          <select
            name="asset_type"
            id="asset_type"
            value={filters.asset_type}
            onChange={handleFilterChange}
            className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Types</option>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Filter by Status
          </label>
          <select
            name="status"
            id="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            {ASSET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        {/* --- ADD THIS NEW FILTER --- */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Filter by Location
          </label>
          <input
            type="text"
            name="location"
            id="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="e.g., Warehouse A"
            className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        {/* --- END OF NEW FILTER --- */}
      </div>

      {/* Asset Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          {loading && <p className="p-4">Loading assets...</p>}
          {error && <p className="p-4 text-red-500">Error: {error}</p>}
          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr key={asset.asset_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {asset.serial_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.asset_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/assets/edit/${asset.asset_id}`} className="text-blue-600 hover:text-blue-900">
                        Edit
                      </Link>
                      {/* We'll add a delete/retire button here later */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && assets.length === 0 && <p className="p-4">No assets found matching criteria.</p>}
        </div>
      </div>
    </div>
  );
}