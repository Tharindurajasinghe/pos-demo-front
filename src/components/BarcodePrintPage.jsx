import React, { useState, useEffect, useRef } from 'react';
import Barcode from 'react-barcode';
import api from '../services/api';
import LoadingOverlay from './LoadingOverlay';

/**
 * BarcodePrintPage Component
 * Shows all products (same table structure as StoreManagement) with a single
 * "Print Barcode" action per row. The print slip contains:
 *   - Product name + variant
 *   - Product ID
 *   - Selling price
 *   - Barcode (visual + value)
 *
 * Bill size is controlled by CSS — easy to adjust.
 */
const BarcodePrintPage = () => {
  const [products, setProducts]                   = useState([]);
  const [categories, setCategories]               = useState([]);
  const [selectedCategory, setSelectedCategory]   = useState('');
  const [searchQuery, setSearchQuery]             = useState('');
  const [filteredProducts, setFilteredProducts]   = useState([]);
  const [pageLoading, setPageLoading]             = useState(true);
  const [printProduct, setPrintProduct]           = useState(null); // product to print
  const printRef = useRef();

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setPageLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, []);

  // ── Filter ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.productId.includes(searchQuery) ||
        (p.variant && p.variant.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.categoryId === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const getProductUniqueKey = (product) =>
    `${product.productId}_${product.variant || 'Standard'}`;

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = (product) => {
    if (!product.barcode) {
      alert('This variant has no barcode. Please generate a barcode for it first in Store Management → Add/Update Product.');
      return;
    }
    setPrintProduct(product);
    // Slight delay so the hidden print div renders before print dialog opens
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Print styles (hidden from screen, shown only on print) ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #barcode-bill, #barcode-bill * { visibility: visible !important; }
          #barcode-bill {
            position: fixed !important;
            top: 0; left: 0;
            margin: 0; padding: 0;
          }
          /* ── BILL SIZE — adjust width/height here ── */
          .bill-slip {
            width: 80mm;
            padding: 4mm 3mm;
            font-family: monospace;
            font-size: 12pt;
            border: 1px solid #000;
            box-sizing: border-box;
            background: #fff;
            color: #000;
          }
          .bill-barcode-wrap {
            width: 100%;
            display: flex;
            justify-content: center;
            margin: 4mm 0 2mm 0;
          }
          .bill-barcode-wrap svg {
            width: 95% !important;
            height: auto !important;
          }
        }
        @media screen {
          #barcode-bill { display: none; }
        }
      `}</style>

      {/* ── Hidden print target ── */}
      <div id="barcode-bill" ref={printRef}>
        {printProduct && (
          <div className="bill-slip">
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap:'6px', marginBottom: '4px' }}>
              <span>ID:</span><span style={{ fontWeight: 'bold' }}>{printProduct.productId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap:'6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '19pt', fontWeight: 'bold' }}>Price:</span>
              <span style={{ fontWeight: 'bold', fontSize: '22pt' , fontFamily: 'Arial'  }}>Rs. {printProduct.sellingPrice.toFixed(2)}</span>
            </div>
            <div className="bill-barcode-wrap">
              <Barcode
                value={printProduct.barcode}
                width={2.8}
                height={80}
                fontSize={25}
                margin={2}
                displayValue={true}
                fontOptions="normal"
                font="Arial"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Screen UI ── */}
      <div className="bg-white p-6 rounded-lg shadow">
        {pageLoading && <LoadingOverlay message="Loading products..." />}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🔖 Barcode Generate & Print</h2>
          <p className="text-sm text-gray-500">
            {filteredProducts.filter(p => p.barcode).length} of {filteredProducts.length} variants have barcodes
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-semibold">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-64 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by ID, Name, or Variant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Table — same structure as StoreManagement, only Action column differs */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Item ID</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Item Name</th>
                <th className="px-4 py-3 text-left">Variant</th>
                <th className="px-4 py-3 text-left">Unit</th>
                <th className="px-4 py-3 text-left">In Stock</th>
                <th className="px-4 py-3 text-left">Selling Price</th>
                <th className="px-4 py-3 text-left">Barcode</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={getProductUniqueKey(product)} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{product.productId}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      product.variant && product.variant !== 'Standard'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.variant || 'Standard'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 font-medium">
                      {product.unit || 'unit'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded ${
                      product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {parseFloat(product.stock.toFixed(3))}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">Rs. {product.sellingPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {product.barcode ? (
                      <span className="font-mono text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        ✓ {product.barcode}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handlePrint(product)}
                      disabled={!product.barcode}
                      className={`text-sm font-semibold px-3 py-1 rounded transition ${
                        product.barcode
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={!product.barcode ? 'No barcode assigned — generate one first' : 'Print barcode label'}
                    >
                      🖨 Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && !pageLoading && (
            <div className="text-center py-8 text-gray-500">No products found</div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Total: {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          <span className="ml-2 text-xs">
            💡 Variants without a barcode cannot be printed. Go to Store Management to add barcodes.
          </span>
        </div>
      </div>
    </>
  );
};

export default BarcodePrintPage;
