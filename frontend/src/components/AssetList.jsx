import React from 'react'
// This is a placeholder for now.
// You would fetch /api/assets here.
export default function AssetList() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Asset Inventory</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Asset list will be displayed here.</p>
        <p>You can fetch data from <strong>/api/assets/splitters</strong> or <strong>/api/assets</strong> to list them.</p>
      </div>
    </div>
  )
}
