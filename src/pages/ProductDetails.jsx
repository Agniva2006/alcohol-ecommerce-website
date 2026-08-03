import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, Star, Minus, Plus, ShoppingCart,
  Store, MapPin, Truck, Shield, ChevronRight,
} from 'lucide-react';
import useProductStore from '../store/productStore';
import { stores } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/helpers';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';
import useToastStore from '../store/toastStore';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getProductById = useProductStore((s) => s.getProductById);
  const allProducts = useProductStore((s) => s.products);
  
  const product = getProductById(id);
  const reviews = []; // Removed mock reviews

  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const toast = useToastStore();

  const [quantity, setQuantity] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);
  }, [product, allProducts]);

  const store = product ? stores.find((s) => s.id === product.storeId) : null;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-2xl font-display font-bold text-dark-800 mb-2">Product not found</h2>
          <p className="text-dark-400 mb-6">The product you are looking for does not exist.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = () => {
    const added = toggleItem(product);
    if (added) toast.success('Added to wishlist');
    else toast.info('Removed from wishlist');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating;

  return (
    <div className="min-h-screen bg-dark-50">
      {/* ─── Back Button ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-500 hover:text-primary transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* ─── Product Hero ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 animate-fade-in">
          {/* Image Column */}
          <div className="relative bg-white rounded-2xl p-6 sm:p-10 flex items-center justify-center shadow-card border border-dark-100 min-h-[400px]">
            {product.discount && (
              <span className="absolute top-4 left-4 bg-accent text-dark text-sm font-bold px-3 py-1.5 rounded-lg z-10">
                {product.discount}% OFF
              </span>
            )}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-all duration-200 z-10 ${
                isWishlisted
                  ? 'bg-red-50 text-red-500'
                  : 'bg-white text-dark-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>
            <img
              src={product.image}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className={`max-h-[360px] max-w-full object-contain transition-all duration-500 ${
                imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
            {!imgLoaded && <div className="absolute inset-0 skeleton rounded-2xl" />}
          </div>

          {/* Info Column */}
          <div className="flex flex-col">
            {/* Stock badge */}
            <span
              className={`self-start text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                product.inStock
                  ? 'bg-primary-50 text-primary'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {product.inStock ? '● In Stock' : '● Out of Stock'}
            </span>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-dark-900 mb-2">
              {product.name}
            </h1>

            {/* Volume + Brand */}
            <p className="text-dark-400 text-base mb-4">
              {product.volume} • {product.brand}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1 bg-primary-50 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-bold text-primary text-sm">{avgRating}</span>
              </div>
              <span className="text-dark-400 text-sm">{product.reviewCount} reviews</span>
            </div>

            {/* Price Block */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl sm:text-4xl font-display font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-dark-400 line-through mb-1">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              {product.discount && (
                <span className="bg-accent/20 text-accent-900 text-sm font-bold px-2.5 py-1 rounded-lg mb-1">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <div className="bg-dark-50 border border-dark-100 rounded-xl p-5 mb-5">
              <h3 className="font-display font-bold text-dark-800 mb-2">Description</h3>
              <p className="text-dark-500 leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* Store Info */}
            {store && (
              <div className="flex items-center gap-3 mb-5 p-4 bg-white rounded-xl border border-dark-100">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-dark-400">Sold by</p>
                  <p className="font-semibold text-dark-800">{store.name}</p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="font-bold text-dark-700">{store.rating}</span>
                </div>
              </div>
            )}

            {/* Delivery & Guarantee */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-dark-100">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-sm text-dark-600 font-medium">
                  {store?.deliveryTime || '30-45 mins'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-dark-100">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-dark-600 font-medium">100% Authentic</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium text-dark-700">Quantity:</span>
              <div className="flex items-center border-2 border-dark-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-dark-50 transition text-dark-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-lg text-dark-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center hover:bg-dark-50 transition text-dark-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-premium"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-dark-200 bg-white text-dark-400 hover:border-red-300 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-dark-200 bg-white text-dark-400 hover:border-primary-300 hover:text-primary transition"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Customer Reviews ─────────────────────────────────────── */}
        {reviews.length > 0 && (
          <section className="mt-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl font-display font-bold text-dark-900 mb-6">Customer Reviews</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review, i) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl p-5 border border-dark-100 shadow-card animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${
                            idx < review.rating
                              ? 'fill-accent text-accent'
                              : 'fill-dark-200 text-dark-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-dark-700">{review.rating}.0</span>
                  </div>
                  <p className="text-dark-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-dark-100">
                    <span className="font-semibold text-dark-700 text-sm">{review.userName}</span>
                    <span className="text-dark-400 text-xs">{formatDate(review.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Similar Products ─────────────────────────────────────── */}
        {similarProducts.length > 0 && (
          <section className="mt-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-dark-900">Similar Products</h2>
              <Link
                to="/search"
                className="text-primary font-medium text-sm flex items-center gap-1 hover:underline"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {similarProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-[220px] sm:w-[250px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
