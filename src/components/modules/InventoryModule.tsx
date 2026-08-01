import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, ArrowRightLeft, Plus, Barcode, Search, RefreshCw } from 'lucide-react';
import { Product, Organization } from '../../types';
import { mockProducts } from '../../data/mockData';

interface InventoryModuleProps {
  currentOrg?: Organization;
  isDarkMode: boolean;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({ currentOrg, isDarkMode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Stock Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [transferQty, setTransferQty] = useState(5);
  const [fromWarehouse, setFromWarehouse] = useState('Primary Warehouse (Mumbai)');
  const [toWarehouse, setToWarehouse] = useState('Bengaluru Regional Hub');

  // New Product Modal State
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('General');
  const [newProdPrice, setNewProdPrice] = useState('999');
  const [newProdCost, setNewProdCost] = useState('500');
  const [newProdStock, setNewProdStock] = useState('50');

  const loadProducts = () => {
    if (!currentOrg?.id) return;
    setIsLoading(true);
    const token = localStorage.getItem('businessos_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/tenant/products?organization_id=${currentOrg.id}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setSelectedProduct(data[0]);
        }
      })
      .catch(err => console.error('Error fetching tenant products:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [currentOrg?.id]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !currentOrg?.id) return;

    try {
      const token = localStorage.getItem('businessos_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/tenant/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          organization_id: currentOrg.id,
          sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          name: newProdName,
          category: newProdCategory,
          price: Number(newProdPrice),
          cost: Number(newProdCost),
          stock: Number(newProdStock),
          minStockAlert: 10,
          unit: 'Pcs',
          barcode: `${Math.floor(8900000000000 + Math.random() * 100000000000)}`,
          gstRate: 18,
        })
      });

      if (res.ok) {
        setShowNewProductModal(false);
        setNewProdName('');
        loadProducts();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStockTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Stock Transfer Triggered: ${transferQty} x ${selectedProduct.name} transferred from ${fromWarehouse} to ${toWarehouse}.`);
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">Inventory & Warehouse Management</h2>
          <p className="text-xs text-neutral-400">Multi-location stock tracking, barcodes, low stock alerts & warehouse transfers.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewProductModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Inter-Warehouse Transfer</span>
          </button>
        </div>
      </div>

      {/* Stock Overview Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-200 min-w-[600px]">
          <thead className={`border-b text-[10px] uppercase font-semibold text-neutral-400 tracking-wider ${
            isDarkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <tr>
              <th className="p-4">SKU / Barcode</th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Selling Price</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Alert Level</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-neutral-400">
                  <Package className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                  <div className="font-bold text-sm text-neutral-300">No data available</div>
                  <p className="text-xs text-neutral-500 mb-4">No inventory items found for this organization.</p>
                  <button
                    onClick={() => setShowNewProductModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add First Product
                  </button>
                </td>
              </tr>
            ) : (
              filteredProducts.map(prod => {
                const isLow = prod.stock <= prod.minStockAlert;
                return (
                  <tr key={prod.id} className="hover:bg-blue-500/5 transition-colors">
                    <td className="p-4 font-mono text-neutral-400">
                      <div className="font-bold text-blue-400">{prod.sku}</div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <Barcode className="w-3 h-3" /> {prod.barcode}
                      </div>
                    </td>
                    <td className="p-4 font-bold">{prod.name}</td>
                    <td className="p-4 text-neutral-300">{prod.category}</td>
                    <td className="p-4 font-bold text-emerald-400">₹{prod.price.toLocaleString()}</td>
                    <td className="p-4 font-black text-sm">
                      {prod.stock} <span className="text-[10px] font-normal text-neutral-400">{prod.unit}</span>
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(prod);
                          setShowTransferModal(true);
                        }}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold"
                      >
                        Transfer
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <h3 className="text-sm font-bold border-b pb-2 border-neutral-800">Inter-Warehouse Stock Transfer</h3>

            <form onSubmit={handleStockTransfer} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Select Item</label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => {
                    const found = products.find(p => p.id === e.target.value);
                    if (found) setSelectedProduct(found);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">From Warehouse</label>
                <input
                  type="text"
                  value={fromWarehouse}
                  onChange={(e) => setFromWarehouse(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">To Destination Warehouse</label>
                <input
                  type="text"
                  value={toWarehouse}
                  onChange={(e) => setToWarehouse(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Confirm Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2.5 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                Add Product to PostgreSQL Database
              </h3>
              <button onClick={() => setShowNewProductModal(false)} className="text-xs text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ERP Cloud License or Dell Latitude"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Category</label>
                  <input
                    type="text"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Initial Stock</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Save Product to Database
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-4 py-2.5 border border-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
