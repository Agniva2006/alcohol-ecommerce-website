import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  Bike,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import Button from '../../components/common/Button';

export default function DeliveryLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const features = [
    { icon: DollarSign, text: 'Earn on your own schedule' },
    { icon: MapPin, text: 'Deliver in your local area' },
    { icon: Clock, text: 'Instant payouts available' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('deliveryToken', 'delivery-dummy-token');
      navigate('/delivery/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex bg-dark-50">
      {/* ─── Left: Branding Panel (Desktop only) ─────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent-600 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-black/5 rounded-full" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-accent-600 font-bold text-xl">S&S</span>
            </div>
            <span className="text-dark-900 text-2xl font-display font-bold">
              Sip & Savor
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-display font-bold text-dark-900 leading-tight mb-4">
            Deliver with us,<br />
            <span className="text-white">earn on your terms.</span>
          </h1>
          <p className="text-dark-800 text-lg mb-10 max-w-md">
            Join our fleet of delivery partners. Set your own hours, deliver premium products, and get paid fast.
          </p>

          {/* Feature pills */}
          <div className="space-y-4">
            {features.map((feat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-dark-900 animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-medium">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right: Login Form ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
              <Bike className="w-8 h-8 text-dark-900" />
            </div>
            <h1 className="text-3xl font-display font-bold text-dark">
              Partner Login
            </h1>
            <p className="text-dark-500 mt-2 text-base">
              Sign in to your delivery dashboard
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-glass p-8">
            <form onSubmit={handleSubmit}>
              {/* Phone Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-dark-400" />
                  </div>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setError('');
                    }}
                    maxLength={10}
                    className="w-full pl-11 pr-4 py-3 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-dark placeholder:text-dark-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-dark-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-11 pr-12 py-3 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-dark placeholder:text-dark-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-dark-400 hover:text-dark-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm mb-4 animate-fade-in">
                  {error}
                </p>
              )}

              {/* Login Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-600 text-dark-900 font-medium py-3 px-4 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
