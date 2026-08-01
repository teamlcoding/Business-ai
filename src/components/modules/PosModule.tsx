import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  QrCode, 
  CreditCard, 
  DollarSign, 
  Printer, 
  Check, 
  X, 
  Receipt,
  Download,
  Percent
} from 'lucide-react';
import { Product, CartItem, Customer } from '../../types';
import { mockProducts, mockCustomers } from '../../data/mockData';

interface PosModuleProps {
  isDarkMode: boolean;
}

export const PosModule: React.FC<PosModuleProps> = ({ isDarkMode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [barcodeInput, setBarcodeInput] = useState('');
  
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Card' | 'Credit'>('UPI');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  // Payment Success / Thermal Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  // Fetch live products and customers from backend
  useEffect(() => {
    const token = localStorage.getItem('businessos_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/tenant/products', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(err => console.error('Error fetching products:', err));

    fetch('/api/tenant/customers', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
          if (data.length > 0) setSelectedCustomer(data[0]);
        }
      })
      .catch(err => console.error('Error fetching customers:', err));
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    const matchesCat = selectedCategory === 'All' ? true : p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, discountPercent: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const found = products.find(p => p.barcode === barcodeInput || p.sku === barcodeInput);
    if (found) {
      addToCart(found);
      setBarcodeInput('');
    } else {
      alert(`No product found with Barcode/SKU: ${barcodeInput}`);
    }
  };

  // Tax and Total calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const gstTaxTotal = cart.reduce((sum, item) => {
    const itemSub = item.product.price * item.quantity;
    return sum + (itemSub * (item.product.gstRate / 100));
  }, 0);

  const globalDiscountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal + gstTaxTotal - globalDiscountAmount;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    const invNo = `POS-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const token = localStorage.getItem('businessos_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/tenant/invoices', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          invNumber: invNo,
          clientName: selectedCustomer?.name || 'Walk-in Customer',
          amount: grandTotal,
          date: new Date().toISOString().split('T')[0],
          status: 'Paid',
          itemsCount: cart.length,
          itemsJson: cart,
        }),
      });
    } catch (err) {
      console.error('Error recording POS sale:', err);
    }

    setReceiptNumber(invNo);
    setShowReceiptModal(true);
  };

  const clearCart = () => {
    setCart([]);
    setShowReceiptModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Area: Barcode & Product Catalog */}
        <div className="flex-1 space-y-4">
          
          {/* Header Controls & Barcode Input */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
          }`}>
            {/* Barcode Search Form */}
            <form onSubmit={handleBarcodeScan} className="flex-1 w-full flex items-center gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Scan barcode or enter SKU (e.g. 890123456701)..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950/60 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 shrink-0"
              >
                Scan
              </button>
            </form>

            {/* Product Title Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950/60 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white' 
                    : isDarkMode ? 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800' : 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isDarkMode 
                    ? 'bg-neutral-900 border-neutral-800 hover:border-blue-500/50' 
                    : 'bg-white border-neutral-200 shadow-sm hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] font-mono text-neutral-400">{product.sku}</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Stock: {product.stock}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-100 dark:text-neutral-100 mt-2 line-clamp-2">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/60">
                  <span className="text-sm font-black text-blue-400">₹{product.price.toLocaleString()}</span>
                  <button className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Area: Live Cart & Fast Checkout Terminal */}
        <div className={`w-full lg:w-96 shrink-0 rounded-2xl border p-5 space-y-4 flex flex-col justify-between ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          
          <div className="space-y-4">
            {/* Terminal Header & Customer Selector */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold">POS Terminal Cart</h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">{cart.length} Items</span>
            </div>

            {/* Select Customer */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Billed Customer</label>
              <select
                value={selectedCustomer.id}
                onChange={(e) => {
                  const found = customers.find(c => c.id === e.target.value);
                  if (found) setSelectedCustomer(found);
                }}
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company || 'Retail'})</option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                  Cart is empty. Click items or scan barcode to add.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-neutral-200">{item.product.name}</p>
                      <p className="text-[10px] text-neutral-400">₹{item.product.price} × {item.quantity} (GST {item.product.gstRate}%)</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} className="p-1 rounded text-rose-400 hover:bg-rose-500/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Breakdown & Payment Options */}
          <div className="space-y-3 pt-3 border-t border-neutral-800/60">
            
            {/* Discount selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Apply Discount (%)</span>
              <input
                type="number"
                min="0"
                max="50"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-16 bg-neutral-950/60 border border-neutral-800 rounded px-2 py-0.5 text-xs text-right text-neutral-100 focus:outline-none"
              />
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (Calculated)</span>
                <span>₹{gstTaxTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              {globalDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-₹{globalDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-neutral-100 pt-2 border-t border-neutral-800">
                <span>Grand Total</span>
                <span className="text-blue-400">₹{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Payment Mode Buttons */}
            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['UPI', 'Cash', 'Card', 'Credit'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      paymentMode === mode 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Complete Sale & Print Receipt</span>
            </button>

          </div>

        </div>

      </div>

      {/* Payment Success Thermal Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white text-neutral-900 rounded-2xl p-6 space-y-4 font-mono shadow-2xl">
            
            <div className="text-center space-y-1 border-b border-neutral-200 pb-3">
              <h3 className="font-extrabold text-base uppercase">Apex Global POS</h3>
              <p className="text-[10px] text-neutral-500">GSTIN: 27AABCU9603R1ZM</p>
              <p className="text-[10px] text-neutral-500">Receipt No: {receiptNumber}</p>
              <p className="text-[10px] text-neutral-500">Date: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-[11px] font-bold">Billed To: {selectedCustomer.name}</p>
              <div className="border-b border-dashed border-neutral-300 pb-2 space-y-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.product.name.slice(0, 18)}..</span>
                    <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax</span>
                  <span>₹{gstTaxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-neutral-300">
                  <span>TOTAL PAID ({paymentMode})</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {paymentMode === 'UPI' && (
              <div className="text-center p-3 bg-neutral-100 rounded-xl space-y-1">
                <QrCode className="w-16 h-16 mx-auto text-neutral-800" />
                <p className="text-[9px] text-neutral-500">Scan via BHIM UPI, PhonePe, Paytm</p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Thermal Print
                </button>
                <button
                  onClick={() => {
                    const cleanPhone = selectedCustomer.phone.replace(/[^0-9]/g, '');
                    const msg = `Hi ${selectedCustomer.name}, thank you for your purchase! Receipt No: ${receiptNumber}. Bill Amount: ₹${grandTotal.toFixed(2)}. Paid via ${paymentMode}.`;
                    const waUrl = cleanPhone 
                      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
                      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                    window.open(waUrl, '_blank');
                  }}
                  className="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                >
                  <Receipt className="w-3.5 h-3.5" /> WhatsApp Receipt
                </button>
              </div>

              <button
                onClick={clearCart}
                className="w-full py-2 border border-neutral-300 text-xs font-semibold rounded-xl hover:bg-neutral-100"
              >
                Done & Next Sale
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
