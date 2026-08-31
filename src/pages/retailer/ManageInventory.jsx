import { useState, useEffect } from 'react';
import { 
  Plus, Search, Pencil, Trash2, Package, AlertTriangle, Save, Check, 
  RefreshCw, TrendingUp, DollarSign, Layers, CheckCircle2, X, Sparkles, Filter
} from 'lucide-react';
import RetailerLayout from '../../components/layout/RetailerLayout';
import { categories } from '../../data/mockData';
import { formatCurrency } from '../../utils/helpers';
import useToastStore from '../../store/toastStore';
import api from '../../api';

export default function ManageInventory() {
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToastStore();

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'whisky',
    volume: '750ml',
    price: '',
    stock: '50',
  });

  const fetchInventory = () => {
    api.get('/retailer/inventory?shopId=SH-JPG-001')
      .then(res => setInventoryProducts(res.data))
      .catch(err => console.error('Failed to fetch inventory:', err));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = inventoryProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'all' || p.category.toLowerCase() === selectedCat.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const toggleStock = async (product) => {
    const nextInStock = !product.inStock;
    try {
      await api.post('/retailer/inventory/update', {
        shopId: 'SH-JPG-001',
        brandId: product.id,
        inStock: nextInStock,
        stock: nextInStock ? 45 : 0
      });
      toast.success(`${product.name} marked ${nextInStock ? 'IN STOCK (45 bottles)' : 'OUT OF STOCK'}`);
      fetchInventory();
    } catch (error) {
      console.error('Failed to toggle stock', error);
      toast.error('Failed to update stock status');
    }
  };

  const handleQuickStockChange = async (product, delta) => {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    try {
      await api.post('/retailer/inventory/update', {
        shopId: 'SH-JPG-001',
        brandId: product.id,
        stock: newStock
      });
      fetchInventory();
      toast.info(`Stock updated: ${product.name} (${newStock} bottles)`);
    } catch (error) {
      toast.error('Failed to update stock count');
    }
  };

  const handleSaveEdit = async (product) => {
    setIsSaving(true);
    try {
      const parsedPrice = parseFloat(editPrice);
      const parsedStock = parseInt(editStock);

      await api.post('/retailer/inventory/update', {
        shopId: 'SH-JPG-001',
        brandId: product.id,
        customPrice: isNaN(parsedPrice) ? product.price : parsedPrice,
        stock: isNaN(parsedStock) ? product.stock : parsedStock
      });
      setEditingId(null);
      fetchInventory();
      toast.success(`Updated ${product.name}: Price ₹${parsedPrice || product.price}, Stock ${parsedStock || product.stock}`);
    } catch (error) {
      console.error('Failed to save edit', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please enter Product Name and Price');
      return;
    }
    try {
      await api.post('/retailer/products/add', {
        shopId: 'SH-JPG-001',
        ...newProduct
      });
      toast.success(`Added ${newProduct.name} to shop inventory!`);
      setShowAddForm(false);
      setNewProduct({ name: '', brand: '', category: 'whisky', volume: '750ml', price: '', stock: '50' });
      fetchInventory();
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const totalBottlesInStock = inventoryProducts.reduce((sum, p) => sum + (p.inStock ? p.stock : 0), 0);
  const totalStockValue = inventoryProducts.reduce((sum, p) => sum + (p.inStock ? p.price * p.stock : 0), 0);

  return (
    <RetailerLayout title="Manage Inventory">
      {/* ─── Top Stats Bar ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-card border border-dark-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center font-bold text-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-dark-500 font-medium">Total Active SKUs</p>
            <h3 className="text-2xl font-bold text-dark-900">{inventoryProducts.length} Brands</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-card border border-dark-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-dark-500 font-medium">Total Bottle Inventory</p>
            <h3 className="text-2xl font-bold text-emerald-600">{totalBottlesInStock} Bottles</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-card border border-dark-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-dark-500 font-medium">Inventory Retail Value</p>
            <h3 className="text-2xl font-bold text-dark-900">{formatCurrency(totalStockValue)}</h3>
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-dark-900">Store Catalog & Live Inventory</h2>
          <p className="text-xs text-dark-500">Denguajhar FL OFF Counter Terminal (SH-JPG-001)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="p-2.5 bg-white border border-dark-200 text-dark-700 rounded-xl hover:bg-dark-50 transition-colors shadow-sm"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-800 transition-colors shadow-premium"
          >
            <Plus className="w-4 h-4" /> Add Drink / SKU
          </button>
        </div>
      </div>

      {/* Add Product Modal / Drawer */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-card border-2 border-primary/20 mb-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark-900 text-base">Add New Liquor Brand / SKU</h3>
            <button onClick={() => setShowAddForm(false)} className="text-dark-400 hover:text-dark-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark-700 mb-1">Brand Name *</label>
              <input 
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-dark-200 rounded-xl focus:outline-none focus:border-primary text-sm" 
                placeholder="e.g. Jameson Irish Whiskey" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-700 mb-1">Category</label>
              <select 
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-dark-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
              >
                <option value="whisky">Whisky</option>
                <option value="beer">Beer</option>
                <option value="rum">Rum</option>
                <option value="vodka">Vodka</option>
                <option value="gin">Gin</option>
                <option value="wine">Wine</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-700 mb-1">Bottle Size</label>
              <input 
                value={newProduct.volume}
                onChange={(e) => setNewProduct({ ...newProduct, volume: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-dark-200 rounded-xl focus:outline-none focus:border-primary text-sm" 
                placeholder="750ml / 650ml" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-700 mb-1">Custom Selling Price (₹) *</label>
              <input 
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-dark-200 rounded-xl focus:outline-none focus:border-primary text-sm" 
                placeholder="₹ MRP" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-700 mb-1">Initial Stock Count (Bottles)</label>
              <input 
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-dark-200 rounded-xl focus:outline-none focus:border-primary text-sm" 
                placeholder="50" 
              />
            </div>
            <div className="flex items-end gap-3">
              <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-colors shadow-sm">
                Save to Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alcohol brands, sizes..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-dark-200 rounded-xl text-sm focus:outline-none focus:border-primary shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['all', 'beer', 'whisky', 'rum', 'vodka', 'gin'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                selectedCat === cat ? 'bg-primary text-white shadow-sm' : 'bg-white border border-dark-200 text-dark-600 hover:bg-dark-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── INVENTORY TABLE ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-card border border-dark-200/50 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-dark-50 text-xs font-bold text-dark-600 uppercase tracking-wider border-b border-dark-200">
          <div className="col-span-4">Alcohol Brand & Size</div>
          <div className="col-span-2">Excise MRP</div>
          <div className="col-span-2">Your Live Price (₹)</div>
          <div className="col-span-2">Stock Count (Bottles)</div>
          <div className="col-span-2 text-right">Status / Action</div>
        </div>

        <div className="divide-y divide-dark-100">
          {filtered.map((product, index) => {
            const isEditing = editingId === product.id;
            const isLowStock = product.inStock && product.stock > 0 && product.stock <= 10;
            const isOutOfStock = !product.inStock || product.stock === 0;

            return (
              <div
                key={product.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-dark-50/60 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {/* Product Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white border border-dark-200 rounded-xl overflow-hidden flex-shrink-0 p-1 shadow-sm">
                    <img src={product.image} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-dark-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-dark-500">
                      <span className="capitalize font-semibold text-primary">{product.category}</span> • {product.volume}
                    </p>
                  </div>
                </div>

                {/* State MRP */}
                <div className="col-span-2 text-xs font-semibold text-dark-500">
                  <span>MRP {formatCurrency(product.mrp)}</span>
                </div>

                {/* Dynamic Selling Price */}
                <div className="col-span-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-dark-600">₹</span>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24 px-2 py-1.5 border-2 border-primary rounded-lg text-sm font-bold focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm font-bold text-dark-900">{formatCurrency(product.price)}</span>
                      {product.customPrice && product.customPrice !== product.mrp && (
                        <span className="block text-[10px] text-amber-600 font-semibold">Custom Set</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Stock Counter */}
                <div className="col-span-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-20 px-2 py-1.5 border-2 border-primary rounded-lg text-sm font-bold focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleQuickStockChange(product, -1)}
                        disabled={product.stock <= 0}
                        className="w-7 h-7 rounded-lg bg-dark-100 hover:bg-dark-200 flex items-center justify-center text-xs font-bold disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="text-sm font-mono font-bold w-8 text-center">{product.stock}</span>
                      <button 
                        onClick={() => handleQuickStockChange(product, 1)}
                        className="w-7 h-7 rounded-lg bg-dark-100 hover:bg-dark-200 flex items-center justify-center text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="col-span-2 flex items-center justify-between md:justify-end gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleSaveEdit(product)}
                        disabled={isSaving}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                        title="Save Changes"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-2 bg-dark-100 hover:bg-dark-200 text-dark-600 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => toggleStock(product)}
                        className="text-left"
                      >
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Low ({product.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> In Stock ({product.stock})
                          </span>
                        )}
                      </button>

                      <button 
                        onClick={() => { 
                          setEditingId(product.id); 
                          setEditPrice(product.price); 
                          setEditStock(product.stock); 
                        }} 
                        className="p-2 text-dark-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit Price & Stock"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RetailerLayout>
  );
}
