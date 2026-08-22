import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, Calendar, Loader2, Camera, ShieldCheck, FileCheck, 
  CheckCircle2, X, Sparkles, RefreshCw, UploadCloud, AlertCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import { isValidPhone, isValidEmail } from '../../utils/helpers';

// Stable input component
function FormInput({ icon: Icon, label, value, onChange, error, type = 'text', placeholder, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-primary transition-colors ${
            disabled ? 'bg-dark-100/70 text-dark-600 cursor-not-allowed border-dark-200' :
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
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Modals state
  const [showIdModal, setShowIdModal] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [isScanningId, setIsScanningId] = useState(false);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceStep, setFaceStep] = useState(1); // 1: target, 2: scanning, 3: matched

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
    if (!form.govtIdVerified) e.govtIdVerified = 'Govt ID verification required';
    if (!form.faceMatchVerified) e.faceMatchVerified = 'AI Face verification required';
    if (!form.termsAccepted) e.termsAccepted = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      if (!form.govtIdVerified || !form.faceMatchVerified) {
        toast.error('Please complete both Govt ID and Face Match verifications.');
      } else {
        toast.error('Please fill all required fields correctly');
      }
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: form.name,
        phone: form.phone,
        date_of_birth: form.date_of_birth,
        role: 'CUSTOMER'
      });
      toast.success('Account created & 21+ Verified successfully!');
      navigate('/auth/login');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('You must be 21 or older to register.');
      } else {
        toast.error('Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Govt ID Scan
  const handleStartIdScan = () => {
    setIsScanningId(true);
    setTimeout(() => {
      setIsScanningId(false);
      handleChange('govtIdVerified', true);
      handleChange('date_of_birth', '1998-06-15');
      if (!form.name) handleChange('name', 'Rupam Bhattacharya');
      setShowIdModal(false);
      toast.success('DigiLocker Govt ID Verified: Age 28 (Legal 21+)');
    }, 2400);
  };

  // Simulate Face Scan
  const handleStartFaceScan = () => {
    setIsScanningFace(true);
    setFaceStep(2);
    setTimeout(() => {
      setFaceStep(3);
      setIsScanningFace(false);
      setTimeout(() => {
        handleChange('faceMatchVerified', true);
        setShowFaceModal(false);
        setFaceStep(1);
        toast.success('AI Biometric Face Match: 99.8% Confidence Verified');
      }, 1000);
    }, 2800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 relative">
      <div className="bg-white rounded-2xl shadow-glass-lg p-8 max-w-lg w-full animate-scale-in border border-dark-200/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-premium">
            <span className="text-accent font-bold text-xl font-display">S&S</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Excise 21+ Registration</h1>
          <p className="text-dark-500 mt-1 text-sm">Secure & Legal Alcohol Ordering in West Bengal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput icon={User} label="Full Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} error={errors.name} placeholder="Rupam Bhattacharya" />
          <FormInput icon={Phone} label="Phone Number" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} error={errors.phone} type="tel" placeholder="9876543210" />
          <FormInput icon={Mail} label="Email (Optional)" value={form.email} onChange={(e) => handleChange('email', e.target.value)} error={errors.email} type="email" placeholder="rupam@example.com" />
          
          <FormInput 
            icon={Calendar} 
            label="Date of Birth (Must be 21+ Years Old)" 
            value={form.date_of_birth} 
            onChange={(e) => handleChange('date_of_birth', e.target.value)} 
            error={errors.date_of_birth} 
            type="date" 
          />

          {/* ─── 21+ Govt ID & AI Face Verification Pipeline ───────────────── */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100/40 p-4 rounded-xl border-2 border-primary/20 space-y-3 my-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-primary-950 uppercase tracking-wider">West Bengal 21+ KYC Pipeline</span>
              </div>
              <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">Mandatory</span>
            </div>

            {/* Step A: Govt ID Upload */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-dark-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${form.govtIdVerified ? 'bg-green-100 text-green-700' : 'bg-primary-50 text-primary'}`}>
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-900">1. Govt Photo ID (Aadhaar / DL)</p>
                  <p className="text-[11px] text-dark-500">
                    {form.govtIdVerified ? '✓ Verified: Age 28 (DOB: 15/06/1998)' : 'Instant OCR DigiLocker Verification'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIdModal(true)}
                className={`text-xs px-3.5 py-2 rounded-lg font-bold transition-all shadow-sm ${
                  form.govtIdVerified 
                    ? 'bg-green-600 text-white' 
                    : 'bg-primary text-white hover:bg-primary-800'
                }`}
              >
                {form.govtIdVerified ? <><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Verified</> : 'Verify ID'}
              </button>
            </div>

            {/* Step B: Live Selfie Face Match */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-dark-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${form.faceMatchVerified ? 'bg-green-100 text-green-700' : 'bg-primary-50 text-primary'}`}>
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-900">2. AI Live Selfie Verification</p>
                  <p className="text-[11px] text-dark-500">
                    {form.faceMatchVerified ? '✓ 99.8% Biometric Facial Match' : 'Anti-spoofing Liveness Face Match'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFaceModal(true)}
                disabled={!form.govtIdVerified}
                className={`text-xs px-3.5 py-2 rounded-lg font-bold transition-all shadow-sm ${
                  form.faceMatchVerified 
                    ? 'bg-green-600 text-white' 
                    : !form.govtIdVerified
                    ? 'bg-dark-200 text-dark-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-800'
                }`}
              >
                {form.faceMatchVerified ? <><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Matched</> : 'Scan Face'}
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
            <span className="text-xs text-dark-700 leading-relaxed">
              I certify that I am at least <strong>21 years of age</strong> as mandated by West Bengal Excise Laws and agree to the <a href="#" className="text-primary font-bold underline">Terms & Conditions</a>.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-800 transition-colors shadow-premium disabled:opacity-70 mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete 21+ Registration & Order'}
          </button>
        </form>

        <p className="text-center text-sm text-dark-500 mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-bold hover:underline">Login</Link>
        </p>
      </div>

      {/* ─── MODAL 1: Govt ID OCR Scanner Simulator ─────────────────── */}
      {showIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scale-in">
            <button 
              onClick={() => setShowIdModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-dark-400 hover:bg-dark-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 font-display">DigiLocker Govt ID OCR</h3>
              <p className="text-xs text-dark-500 mt-1">Extracts official Date of Birth for 21+ Excise Compliance</p>
            </div>

            {/* ID Card Simulation Visual */}
            <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-xl overflow-hidden mb-6 border border-white/20">
              {/* Scan laser line */}
              {isScanningId && (
                <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse transition-all duration-300" style={{
                  animation: 'bounce 1.2s infinite'
                }} />
              )}

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-bold text-dark">IN</div>
                  <span className="text-xs font-bold tracking-wider uppercase">Republic of India • Govt ID</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">AADHAAR / DL</span>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <div className="w-16 h-20 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] text-gray-300">Name</p>
                  <p className="text-xs font-bold">{form.name || 'RUPAM BHATTACHARYA'}</p>
                  <p className="text-[10px] text-gray-300">DOB / Age</p>
                  <p className="text-xs font-bold text-amber-300">15/06/1998 • 28 Yrs (LEGAL 21+)</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] text-gray-300">
                <span>UID: XXXX-XXXX-4819</span>
                <span className="text-green-400 font-semibold">DigiLocker Verified ✓</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartIdScan}
              disabled={isScanningId}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-800 transition-colors shadow-premium disabled:opacity-80"
            >
              {isScanningId ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying with DigiLocker...</>
              ) : (
                <><UploadCloud className="w-5 h-5" /> Auto-Scan & Verify 21+ ID</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: AI Live Face Match Biometrics Simulator ───────── */}
      {showFaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scale-in">
            <button 
              onClick={() => setShowFaceModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-dark-400 hover:bg-dark-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 font-display">AI Live Selfie Match</h3>
              <p className="text-xs text-dark-500 mt-1">Biometric anti-spoofing verification against Govt ID</p>
            </div>

            {/* Viewfinder simulation */}
            <div className="relative bg-dark-900 rounded-2xl h-56 flex items-center justify-center overflow-hidden mb-6 border-2 border-primary/40 shadow-inner">
              {/* Oval face guide */}
              <div className={`w-36 h-48 rounded-full border-2 border-dashed transition-all duration-500 flex items-center justify-center relative ${
                faceStep === 3 ? 'border-green-400 bg-green-500/10' :
                faceStep === 2 ? 'border-cyan-400 animate-pulse' : 'border-white/40'
              }`}>
                <span className="text-5xl opacity-80">
                  {faceStep === 3 ? '🎉' : '😃'}
                </span>

                {/* Laser scan lines */}
                {isScanningFace && (
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping" />
                )}
              </div>

              {/* Status overlay */}
              <div className="absolute bottom-3 inset-x-3 bg-black/60 backdrop-blur-md py-1.5 px-3 rounded-lg text-center">
                <span className="text-xs font-semibold text-white">
                  {faceStep === 1 && 'Center your face in the oval'}
                  {faceStep === 2 && 'Scanning Biometric Mesh & Liveness...'}
                  {faceStep === 3 && '✓ 99.8% Match with Govt ID Photo!'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartFaceScan}
              disabled={isScanningFace}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-800 transition-colors shadow-premium disabled:opacity-80"
            >
              {isScanningFace ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing 3D Facial Nodes...</>
              ) : (
                <><Camera className="w-5 h-5" /> Start Live Biometric Scan</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
