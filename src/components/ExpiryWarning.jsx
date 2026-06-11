import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * ExpiryWarning Component
 *
 * Shows all product variants that have at least one expiry date
 * within the next 10 days, or already expired.
 *
 * Each row = one (product variant + expiry date) combination.
 * To remove a warning, the user must go to Update Product and
 * manually delete that expire date from the variant.
 *
 * Auto-refreshes every 5 minutes while mounted.
 */
const ExpiryWarning = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    try {
      const res = await api.getExpiringProducts();
      setWarnings(res.data);
    } catch {
      // silently fail — not critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-gray-400 text-sm">
        Loading expiry data...
      </div>
    );
  }

  if (warnings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 text-green-600 font-semibold">
          <span>✅</span>
          <span>No Expiry Warnings</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">All products are within safe expiry range.</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg shadow">

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-red-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span className="font-bold text-red-700 text-base">Expiry Warning</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {warnings.length} item{warnings.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={load}
            className="text-xs text-red-500 hover:text-red-700 underline"
            title="Refresh"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-red-100">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Product ID</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Category</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Product Name</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Expire Date</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {warnings.map((w, i) => (
              <tr
                key={i}
                className={`border-t border-red-100 ${w.isExpired ? 'bg-red-100' : 'bg-white'}`}
              >
                <td className="px-3 py-2 font-bold text-gray-800">{w.productId}</td>
                <td className="px-3 py-2">
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {w.categoryName}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-800">
                  {w.name}
                  {w.variant && w.variant !== 'Standard' && (
                    <span className="ml-1 text-xs text-gray-500">({w.variant})</span>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-700 font-medium">
                  {formatDate(w.expireDate)}
                </td>
                <td className="px-3 py-2">
                  {w.isExpired ? (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      EXPIRED
                    </span>
                  ) : (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      EXPIRING SOON
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 border-t border-red-200">
        <p className="text-xs text-red-600">
          ⓘ To remove a warning, go to <strong>Store → Update Product</strong> and delete the expire date for that variant.
        </p>
      </div>
    </div>
  );
};

export default ExpiryWarning;