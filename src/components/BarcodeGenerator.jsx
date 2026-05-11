import React from 'react';
import Barcode from 'react-barcode';

/**
 * BarcodeGenerator Component
 * Used inside AddProduct modal.
 * Shows a "Generate Barcodes" button. When clicked, it auto-generates
 * a unique barcode for each variant row that doesn't already have one.
 * User can then accept (keep) or clear individual barcodes.
 *
 * Props:
 *   variantRows        - array of variant row objects (from AddProduct state)
 *   productId          - the current product ID string (e.g. "042")
 *   onUpdateBarcode    - fn(index, barcodeValue) to update a specific row's barcode
 */
const BarcodeGenerator = ({ variantRows, productId, onUpdateBarcode }) => {

  /**
   * Generates a unique barcode string for a variant.
   * Format: PROD{productId}{variantIndex+1}{timestamp-last5digits}
   * Example: PROD042101234  (productId=042, variantIndex=0, timestamp suffix)
   * This ensures uniqueness across time and product/variant combinations.
   */
  const generateBarcodeValue = (index) => {
    const timestamp = Date.now().toString().slice(-5);
    const variantNum = String(index + 1).padStart(2, '0');
    return `PROD${productId}${variantNum}${timestamp}`;
  };

  const handleGenerateAll = () => {
    variantRows.forEach((row, index) => {
      if (!row.barcode) {
        // small delay per row so timestamps differ slightly for uniqueness
        setTimeout(() => {
          onUpdateBarcode(index, generateBarcodeValue(index));
        }, index * 5);
      }
    });
  };

  const handleClearBarcode = (index) => {
    onUpdateBarcode(index, '');
  };

  const handleRegenerateOne = (index) => {
    onUpdateBarcode(index, generateBarcodeValue(index));
  };

  const hasAnyBarcode = variantRows.some(r => r.barcode && r.barcode.trim());
  const allHaveBarcodes = variantRows.every(r => r.barcode && r.barcode.trim());

  return (
    <div className="mt-4 border border-dashed border-green-400 rounded-lg p-4 bg-green-50">
      {/* Header row */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-semibold text-gray-700 text-sm">🔖 Barcode Generation</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Generate unique barcodes for each variant. You can remove any you don't want.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerateAll}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-semibold flex items-center gap-1"
        >
          🔄 {allHaveBarcodes ? 'Regenerate All' : 'Generate Barcodes'}
        </button>
      </div>

      {/* Barcode previews */}
      {hasAnyBarcode && (
        <div className="space-y-3 mt-2">
          {variantRows.map((row, index) => {
            const variantLabel = row.variant?.trim() || `Variant ${index + 1}`;
            return (
              <div
                key={index}
                className="flex items-center gap-4 bg-white rounded border border-gray-200 p-3"
              >
                {/* Variant label */}
                <div className="w-28 flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-600 block">
                    {variantLabel}
                  </span>
                  <span className="text-xs text-gray-400">
                    Rs. {row.sellingPrice || '—'}
                  </span>
                </div>

                {/* Barcode preview or placeholder */}
                <div className="flex-1 flex items-center">
                  {row.barcode ? (
                    <div className="flex items-center gap-3">
                      <div style={{ lineHeight: 0 }}>
                        <Barcode
                          value={row.barcode}
                          width={1.2}
                          height={40}
                          fontSize={10}
                          margin={2}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-mono">{row.barcode}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No barcode — click generate</span>
                  )}
                </div>

                {/* Per-variant actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {row.barcode ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRegenerateOne(index)}
                        className="text-xs text-blue-600 hover:underline"
                        title="Regenerate this barcode"
                      >
                        🔄 New
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClearBarcode(index)}
                        className="text-xs text-red-500 hover:underline"
                        title="Remove barcode for this variant"
                      >
                        ✕ Remove
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRegenerateOne(index)}
                      className="text-xs text-green-600 hover:underline"
                    >
                      + Generate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!hasAnyBarcode && (
        <p className="text-xs text-gray-400 text-center py-2">
          Press "Generate Barcodes" to auto-create a unique barcode for each variant.
        </p>
      )}
    </div>
  );
};

export default BarcodeGenerator;
