import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';

export default function Login() {
  const navigate = useNavigate();
  const { loginStep, isLoading, isAuthenticated, sendOtp, verifyOtp, resetLoginStep } = useAuthStore();
  const toast = useToastStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  // Reset login step on mount
  useEffect(() => {
    resetLoginStep();
  }, [resetLoginStep]);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Focus first OTP input when step changes
  useEffect(() => {
    if (loginStep === 'otp') {
      otpRefs[0].current?.focus();
      setResendTimer(30);
    }
  }, [loginStep]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    try {
      await sendOtp(cleaned);
      toast.info('OTP Sent! (Use test OTP: 1234)');
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    const cleanedPhone = phone.replace(/\s/g, '');
    try {
      await verifyOtp(otpStr, cleanedPhone);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Invalid OTP. Please enter 1234.');
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    sendOtp(phone.replace(/\s/g, ''));
    setOtp(['', '', '', '']);
    setResendTimer(30);
    toast.info('OTP resent successfully');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-glass-lg p-8 max-w-md w-full animate-scale-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-premium">
            <span className="text-accent font-bold text-xl font-display">S&S</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Welcome Back!</h1>
          <p className="text-dark-500 mt-2">Enter your mobile number to continue</p>
        </div>

        {/* Phone Step */}
        {loginStep === 'phone' && (
          <form onSubmit={handleSendOtp} className="animate-fade-in">
            <div className="relative mb-6">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <span className="absolute left-12 top-1/2 -translate-y-1/2 text-dark-600 font-medium">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))}
                placeholder="98765 43210"
                className="w-full pl-[5.5rem] pr-4 py-4 border-2 border-dark-200 rounded-xl focus:outline-none focus:border-primary text-lg tracking-wider"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-800 transition-colors shadow-premium disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Send OTP <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {loginStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="animate-slide-in-right">
            <div className="mb-2 text-center">
              <p className="text-sm text-dark-500">OTP sent to <span className="font-semibold text-dark-800">+91 {phone}</span></p>
              <button type="button" onClick={() => resetLoginStep()} className="text-primary text-sm font-medium hover:underline mt-1">
                Change number
              </button>
            </div>

            <div className="flex gap-3 justify-center my-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-dark-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-800 transition-colors shadow-premium disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
            </button>

            <div className="text-center mt-4">
              {resendTimer > 0 ? (
                <p className="text-sm text-dark-400">Resend OTP in <span className="font-semibold text-dark-700">{resendTimer}s</span></p>
              ) : (
                <button type="button" onClick={handleResendOtp} className="text-sm text-primary font-medium hover:underline">
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* Age Verification Note */}
        <div className="mt-8 flex items-start gap-3 bg-primary-50 rounded-xl p-3">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-primary-900 leading-relaxed">
            By continuing, you confirm you are <strong>21 years or older</strong> and agree to our{' '}
            <a href="#" className="underline font-medium">Terms & Conditions</a>.
          </p>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-dark-500 mt-6">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
