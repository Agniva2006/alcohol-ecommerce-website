import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Clock, ChevronRight } from 'lucide-react';
import { categories } from '../data/mockData';
import ProductCard from '../components/product/ProductCard';
import api from '../api';

function useOnScreen(ref, threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold }
    );
    const current = ref.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [ref, threshold]);
  return isVisible;
}

function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isVisible = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [realStores, setRealStores] = useState([]);
  const [apiProducts, setApiProducts] = useState([]);
  const categoryScrollRef = useRef(null);

  useEffect(() => {
    // Fetch nearby shops from backend (e.g. JGEC location)
    api.get('/shops/nearby?lat=26.5410&lng=88.7122&radius=6')
      .then(res => setRealStores(res.data))
      .catch(err => console.error("Failed to fetch shops:", err));
      
    // Fetch products
    api.get('/products')
      .then(res => setApiProducts(res.data))
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  const trendingProducts = apiProducts.filter(p => p.featured);
  const filteredProducts = activeCategory
    ? apiProducts.filter(p => p.category === activeCategory)
    : apiProducts;
  const remainingProducts = filteredProducts.filter(p => !p.tags?.includes('bestseller'));

  return (
    <div className="min-h-screen">
      {/* ─── Hero Banner ───────────────────────────────────────────── */}
      <section className="relative gradient-hero overflow-hidden">
        {/* Decorative floating circles */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white opacity-[0.04] animate-bounce-subtle" />
        <div className="absolute -top-20 right-20 w-96 h-96 rounded-full bg-accent opacity-[0.06]" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 rounded-full bg-white opacity-[0.03] animate-bounce-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-accent opacity-[0.05]" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-primary-400 opacity-[0.08]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl animate-fade-in">
            <span className="inline-block bg-accent/20 text-accent text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-accent/20">
              🎉 Limited Time Offer
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-4">
              UPTO <span className="text-accent">20% OFF</span> on Selected Brands!
            </h1>
            <p className="text-lg sm:text-xl text-primary-200 mb-8 max-w-lg">
              Premium spirits delivered to your doorstep from licensed stores near you. Fast, safe & legal.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-600 text-dark font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 text-lg"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F8F9FA] to-transparent" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Categories ──────────────────────────────────────────── */}
        <AnimatedSection className="py-8" delay={100}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-display font-bold text-dark-900">Browse Categories</h2>
          </div>
          <div
            ref={categoryScrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
          >
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all duration-200 min-w-[100px]
                ${!activeCategory
                  ? 'border-primary bg-primary-50 text-primary shadow-premium'
                  : 'border-dark-200 bg-white text-dark-600 hover:border-primary-300 hover:bg-primary-50'
                }`}
            >
              <span className="text-2xl">🍾</span>
              <span className="text-sm font-medium whitespace-nowrap">All</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all duration-200 min-w-[100px]
                  ${activeCategory === cat.id
                    ? 'border-primary bg-primary-50 text-primary shadow-premium'
                    : 'border-dark-200 bg-white text-dark-600 hover:border-primary-300 hover:bg-primary-50'
                  }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{cat.name}</span>
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* ─── Trending Now ───────────────────────────────────── */}
        <AnimatedSection className="mb-16 pt-8" delay={200}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark-900">Trending Now</h2>
            <Link to="/search" className="text-primary font-medium hover:text-primary-600 flex items-center gap-1 group">
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingProducts.length > 0 ? trendingProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            )) : (
              <p className="text-dark-500">Loading products from backend...</p>
            )}
          </div>
        </AnimatedSection>

        {/* ─── Nearby Licensed Stores ──────────────────────────────── */}
        <AnimatedSection className="py-6" delay={200}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-display font-bold text-dark-900">Nearby Licensed Stores</h2>
            <Link to="/search" className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {realStores.length > 0 ? realStores.map((store) => (
              <div key={store.id} className="bg-white rounded-2xl p-6 shadow-sm border border-dark-200 hover:shadow-md transition-shadow cursor-pointer group flex-shrink-0 w-[300px] sm:w-[340px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-dark group-hover:text-primary transition-colors">{store.name}</h3>
                  <div className="flex items-center gap-1 text-sm font-semibold bg-accent-50 text-accent-700 px-2 py-1 rounded-md">
                    <Star className="w-3 h-3 fill-accent-500" />
                    <span>4.5</span>
                  </div>
                </div>
                <p className="text-dark-500 text-sm mb-4 line-clamp-2">{store.locationName || store.licenseType}</p>
                <div className="flex items-center gap-4 text-sm text-dark-600 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-dark-400" />
                    ~3 km
                  </span>
                  <span className="flex items-center gap-1 text-green-600">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    {store.status === 'ACTIVE' ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-dark-500">Loading nearby shops from backend...</p>
            )}
          </div>
        </AnimatedSection>


        {/* ─── All Products ───────────────────────────────────────── */}
        <AnimatedSection className="py-6 pb-12" delay={400}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-display font-bold text-dark-900">
                {activeCategory
                  ? `${categories.find(c => c.id === activeCategory)?.name || 'Products'}`
                  : 'All Products'}
              </h2>
              <p className="text-dark-400 text-sm mt-1">
                {filteredProducts.length} products available
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {(activeCategory ? filteredProducts : remainingProducts).map((product, i) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-display font-bold text-dark-700 mb-2">No products found</h3>
              <p className="text-dark-400">Try selecting a different category</p>
            </div>
          )}
        </AnimatedSection>
      </div>
    </div>
  );
}
