import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config';

const VerifyRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const devOtp = location.state?.simulatedOtp || null;
  const [emailWarning, setEmailWarning] = useState(location.state?.emailWarning || false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendOtp, setResendOtp] = useState(devOtp); // For dev mode display

  // Redirect if no email in state (direct navigation)
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-fill OTP in dev mode
  useEffect(() => {
    if (devOtp) {
      setCode(devOtp.split(''));
    }
  }, [devOtp]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return; // Only allow digits
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`reg-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setCode(pastedData.split(''));
      const lastInput = document.getElementById('reg-otp-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerify = useCallback(async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6 || isLoading) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/verify-registration`, {
        email,
        otp: fullCode
      });

      // Success! Store auth data and redirect
      setSuccess('✅ Email verified! Redirecting to dashboard...');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [code, email, isLoading, navigate]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;

    try {
      const res = await axios.post(`${API_BASE}/api/auth/resend-registration-otp`, { email });
      setResendCooldown(30);
      setError('');
      setEmailWarning(res.data.emailWarning || false);
      setSuccess('New verification code sent to your email!');

      // Dev mode: auto-fill new OTP
      if (res.data.simulatedOtp) {
        setResendOtp(res.data.simulatedOtp);
        setCode(res.data.simulatedOtp.split(''));
      }

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
    }
  }, [email, resendCooldown]);

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-teal-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="text-gray-500 mt-3 text-sm">
            We sent a 6-digit verification code to
          </p>
          <p className="font-bold text-gray-900 mt-1">{email}</p>
        </div>

        {/* Email Warning Notice */}
        {emailWarning && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm text-center">
            <p className="font-bold">⚠️ Email delivery was slow</p>
            <p className="mt-1">If you don't receive the code within a minute, click <strong>"Resend Code"</strong> below.</p>
          </div>
        )}

        {/* Dev Mode Notice */}
        {resendOtp && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm text-center">
            <p className="font-bold">✅ Dev Mode: OTP auto-filled!</p>
            <p className="mt-1">Code: <span className="font-mono font-bold text-lg tracking-widest">{resendOtp}</span></p>
            <p className="text-green-600 text-xs mt-1">Click "Verify & Create Account" to continue.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && !error && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm text-center">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* OTP Input */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter Verification Code</label>
            <div className="flex justify-between space-x-2">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  id={`reg-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={code.join('').length < 6 || isLoading}
            className="w-full bg-teal-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Verifying...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Verify & Create Account</span>
              </span>
            )}
          </button>
        </form>

        {/* Resend & Back */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-gray-500 text-sm">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={`font-bold transition-colors ${
                resendCooldown > 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-teal-600 hover:text-teal-700'
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </p>
          <p>
            <Link to="/register" className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
              ← Back to Registration
            </Link>
          </p>
        </div>

        {/* Timer info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Code expires in 5 minutes</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyRegistration;
