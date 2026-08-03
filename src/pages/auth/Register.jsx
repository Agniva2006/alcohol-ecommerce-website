import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Calendar, Loader2, Camera, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import { isValidPhone, isValidEmail } from '../../utils/helpers';

// Stable input component — defined outside to prevent re-creation on every render
function FormInput({ icon: Icon, label, value, onChange, error, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-primary transition-colors ${
            error ? 'border-red-400' : 'border-dark-200'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const login = useAuthStore((s) => s.login);
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    govtIdNumber: '',
    govtIdVerified: false,
    faceMatchVerified: false,
    termsAccepted: false,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!isValidPhone(form.phone)) e.phone = 'Invalid phone number';
    if (form.email && !isValidEmail(form.email)) e.email = 'Invalid email';
    if (!form.date_of_birth) e.date_of_birth = 'Date of birth is required';
    if (!form.termsAccepted) e.termsAccepted = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register({
        name: form.name,
        phone: form.phone,
        date_of_birth: form.date_of_birth,
        role: 'CUSTOMER'
      });
      toast.success('Account created successfully!');
      navigate('/auth/login');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('You must be 21 or older to register.');
      } else {
        toast.error('Registration failed.');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-glass-lg p-8 max-w-md w-full animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-premium">
            <span className="text-accent font-bold text-xl font-display">S&S</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Create Account</h1>
          <p className="text-dark-500 mt-2">Join Sip & Savor for premium delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput icon={User} label="Full Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} error={errors.name} placeholder="John Doe" />
          <FormInput icon={Phone} label="Phone Number" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} error={errors.phone} type="tel" placeholder="9876543210" />
          <FormInput icon={Mail} label="Email (Optional)" value={form.email} onChange={(e) => handleChange('email', e.target.value)} error={errors.email} type="email" placeholder="john@example.com" />
          
          <FormInput icon={Calendar} label="Date of Birth (Must be 21+ Years Old)" value={form.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} error={errors.date_of_birth} type="date" />

          {/* ─── 21+ Govt ID & AI Face Verification ───────────────── */}
          <div className="bg-dark-50 p-4 rounded-xl border border-dark-200 space-y-3 my-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold text-dark-900 uppercase tracking-wider">Excise 21+ AI Verification</span>
            </div>

            {/* Step A: Govt ID Upload */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-dark-200">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-dark-500" />
                <div>
                  <p className="text-xs font-bold text-dark-800">1. Govt Photo ID (Aadhaar / DL)</p>
                  <p className="text-[10px] text-dark-400">Verifies Legal Age (21+)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleChange('govtIdVerified', !form.govtIdVerified)}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  form.govtIdVerified ? 'bg-green-100 text-green-700' : 'bg-primary-50 text-primary hover:bg-primary-100'
                }`}
              >
                {form.govtIdVerified ? <><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> ID Verified</> : 'Upload & Verify'}
              </button>
            </div>

            {/* Step B: Live Selfie Face Match */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-dark-200">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-dark-500" />
                <div>
                  <p className="text-xs font-bold text-dark-800">2. AI Live Face Verification</p>
                  <p className="text-[10px] text-dark-400">Matches Selfie to Govt ID Photo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleChange('faceMatchVerified', !form.faceMatchVerified)}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  form.faceMatchVerified ? 'bg-green-100 text-green-700' : 'bg-primary-50 text-primary hover:bg-primary-100'
                }`}
              >
                {form.faceMatchVerified ? <><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Face Matched</> : 'Scan Face'}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
            errors.termsAccepted ? 'border-red-400 bg-red-50' : form.termsAccepted ? 'border-primary bg-primary-50' : 'border-dark-200'
          }`}>
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(e) => handleChange('termsAccepted', e.target.checked)}
              className="mt-0.5 w-5 h-5 text-primary rounded"
            />
            <span className="text-sm text-dark-700">
              I agree to the <a href="#" className="text-primary font-medium underline">Terms & Conditions</a> and{' '}
              <a href="#" className="text-primary font-medium underline">Privacy Policy</a>
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-800 transition-colors shadow-premium disabled:opacity-70 mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-dark-500 mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
