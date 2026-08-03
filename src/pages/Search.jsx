import { useState, useCallback, useRef, useEffect } from 'react';
import { Search as SearchIcon, X, Clock, SlidersHorizontal } from 'lucide-react';
import { categories } from '../data/mockData';
import useProductStore from '../store/productStore';
import ProductCard from '../components/product/ProductCard';
import { debounce } from '../utils/helpers';

const priceRanges = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
  { label: '₹2,500 – ₹5,000', min: 2500, max: 5000 },
  { label: '₹5,000+', min: 5000, max: Infinity },
];

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
];

export default function SearchPage() {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches] = useState(['Jack Daniels', 'Beer', 'Red Wine', 'Vodka']);

  const products = useProductStore(s => s.products);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Use local search instead of mockData's searchProducts
  const searchProductsLocal = (q) => {
    return products.filter(p => 
      p.name.toLowerCase().includes(q.toLowerCase()) || 
      (p.brand && p.brand.toLowerCase().includes(q.toLowerCase()))
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((q) => {
      if (q.trim()) {
        setResults(searchProductsLocal(q));
      } else {
        setResults([]);
      }
    }, 250),
    [products]
  );

  const handleChange = (value) => {
    setQuery(value);
    debouncedSearch(value);
  };

  const handleRecentSearch = (term) => {
    setQuery(term);
    setResults(searchProductsLocal(term));
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  // Apply filters and sort
  let filteredResults = query ? [...results] : [...products];

  if (selectedCategory) {
    filteredResults = filteredResults.filter((p) => p.category === selectedCategory);
  }

  if (selectedPrice !== null) {
    const range = priceRanges[selectedPrice];
    filteredResults = filteredResults.filter((p) => p.price >= range.min && p.price < range.max);
  }

  switch (sortBy) {
    case 'price-asc':
      filteredResults.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filteredResults.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredResults.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  const showEmptySearch = query && filteredResults.length === 0;
  const showRecentSearches = !query && results.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search for brands, products, categories..."
          className="w-full pl-12 pr-12 py-4 bg-white border border-dark-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-card transition-all"
        />
        {query && (
          <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters ? 'bg-primary text-white' : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          {(selectedCategory || selectedPrice !== null) && (
            <button
              onClick={() => { setSelectedCategory(''); setSelectedPrice(null); }}
              className="text-sm text-red-500 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-dark-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
        >
          {sortOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-5 shadow-card border border-dark-200/50 mb-6 animate-fade-in">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-dark-700 mb-3">Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory ? 'bg-primary text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-700 mb-3">Price Range</h3>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPrice(selectedPrice === i ? null : i)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedPrice === i ? 'bg-primary text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {showRecentSearches && (
        <div className="mb-8 animate-fade-in">
          <h3 className="text-sm font-semibold text-dark-500 uppercase tracking-wider mb-3">Recent Searches</h3>
          <div className="space-y-1">
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => handleRecentSearch(term)}
                className="flex items-center gap-3 w-full py-2.5 px-3 rounded-lg hover:bg-dark-50 transition-colors text-left"
              >
                <Clock className="w-4 h-4 text-dark-400" />
                <span className="text-dark-700">{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      {(query || selectedCategory || selectedPrice !== null) && !showEmptySearch && (
        <p className="text-sm text-dark-500 mb-4">
          {filteredResults.length} product{filteredResults.length !== 1 ? 's' : ''} found
          {query && <span className="font-medium"> for "{query}"</span>}
        </p>
      )}

      {/* Empty State */}
      {showEmptySearch && (
        <div className="text-center py-16 animate-fade-in">
          <SearchIcon className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-700 mb-1">No products found</h3>
          <p className="text-dark-500 text-sm">Try a different search term or adjust your filters.</p>
        </div>
      )}

      {/* Results Grid */}
      {filteredResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredResults.map((product, i) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
