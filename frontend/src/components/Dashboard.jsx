import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link

// A simple, reusable component for the stat cards
function StatCard({ title, value, loading, icon, to }) {
  const cardContent = (
    <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        {loading ? (
          <div className="text-3xl font-bold text-gray-900 animate-pulse bg-gray-200 rounded w-12 h-8 mt-1"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        )}
      </div>
      <div className="text-gray-300">
        {icon}
      </div>
    </div>
  );

  // If 'to' prop is provided, wrap the card in a Link
  if (to) {
    return (
      <Link to={to} className="hover:opacity-80 transition-opacity">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    availableAssets: 0,
    pendingTasks: 1, // Static for now
    totalFDHs: 0,
    totalSplitters: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [customersRes, assetsRes, fdhsRes, splittersRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/inventory-assets?status=Available'),
          fetch('/api/network-hierarchy/fdhs'),
          fetch('/api/network-hierarchy/splitters'),
          // We will add the /api/tasks fetch here in Sprint 4
        ]);

        if (!customersRes.ok || !assetsRes.ok || !fdhsRes.ok || !splittersRes.ok) {
          throw new Error('Failed to fetch all dashboard data');
        }

        const customersData = await customersRes.json();
        const assetsData = await assetsRes.json();
        const fdhsData = await fdhsRes.json();
        const splittersData = await splittersRes.json();

        setStats(prevStats => ({
          ...prevStats,
          totalCustomers: customersData.length,
          availableAssets: assetsData.length,
          totalFDHs: fdhsData.length,
          totalSplitters: splittersData.length,
        }));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Run once on component mount

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          loading={loading}
          to="/customers"
        />
        <StatCard
          title="Available Assets"
          value={stats.availableAssets}
          loading={loading}
          to="/assets"
        />
        {/* This new card shows FDH/Splitter counts and links to the hierarchy page */}
        <StatCard
          title="Network Topology"
          value={`${stats.totalFDHs} FDHs / ${stats.totalSplitters} Splitters`}
          loading={loading}
          to="/network-hierarchy"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          loading={loading} // This will just show '1' after loading
          to="/tasks"
        />
      </div>
      
      {!loading && !error && (
        <div className="mt-6 bg-blue-50 text-blue-700 p-4 rounded-md text-sm">
          <strong>Note:</strong> The 'Pending Tasks' card is using static data. Its live API endpoint will be built in Sprint 4.
        </div>
      )}
    </div>
  );
}