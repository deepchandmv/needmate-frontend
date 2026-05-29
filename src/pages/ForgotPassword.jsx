import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [sandboxCode, setSandboxCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendCode = useCallback(async (e) => {
    e.preventDefault();
    if (!email || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      if (res.data.simulatedOtp) {
        const otpDigits = res.data.simulatedOtp.split('');
        setCode(otpDigits);
        setSandboxCode(res.data.simulatedOtp);
      }
      setStep(2);
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  }, [email, isLoading]);

  const handleVerifyCode = useCallback(async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6 && !isLoading) {
      setIsLoading(true);
      setError('');
      try {
         await axios.post(`${API_BASE}/api/auth/verify-otp`, { email, otp: fullCode });
         setStep(3);
      } catch (err) {
         setError(err.response?.data?.error || 'Invalid OTP');
      } finally {
        setIsLoading(false);
      }
    }
  }, [code, email, isLoading]);

  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    const fullCode = code.join('');
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, { email, otp: fullCode, newPassword });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply new password.');
    } finally {
      setIsLoading(false);
    }
  }, [code, email, newPassword, isLoading, navigate]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setResendCooldown(30);
      setError('');
      setSuccess('New code sent to your email!');
      if (res.data.simulatedOtp) {
        setSandboxCode(res.data.simulatedOtp);
        setCode(res.data.simulatedOtp.split(''));
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch(e) {
      setError('Failed to resend code');
    }
  }, [email, resendCooldown]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setCode(pastedData.split(''));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-xl mx-auto flex items-center justify-center mb-4 text-white text-3xl font-bold shadow-lg shadow-teal-200">
            N
          </div>
          {step === 1 && (
             <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          )}
          {step === 2 && (
             <h2 className="text-3xl font-bold text-gray-900">Enter Code</h2>
          )}
          {step === 3 && (
             <h2 className="text-3xl font-bold text-gray-900">New Password</h2>
          )}
        </div>

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

        {step === 1 && (
          <>
            <p className="text-gray-500 mt-2 text-center mb-8">
              Enter your email address and we'll send you a verification code.
            </p>

            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    placeholder="student@university.edu"
                  />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 transition-all shadow-md disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Sending Code...</span>
                  </span>
                ) : 'Send Code'}
              </button>
            </form>
            
            <p className="text-center mt-8 text-gray-600">
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium pb-1 border-b border-transparent hover:border-teal-600 transition-all">
                Back to Sign In
              </Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            {sandboxCode ? (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm mb-6 text-center">
                <p className="font-bold">✅ Dev Mode: OTP auto-filled!</p>
                <p className="mt-1">Code: <span className="font-mono font-bold text-lg">{sandboxCode}</span></p>
                <p className="text-green-600 text-xs mt-1">Just click "Verify Code" to continue.</p>
              </div>
            ) : (
              <p className="text-gray-500 mt-2 text-center mb-10">
                We sent a verification code to <span className="font-bold text-gray-900">{email}</span>.
              </p>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Verification Code</label>
                <div className="flex justify-between space-x-2">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`code-input-${idx}`}
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
                className="w-full bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 transition-all shadow-md"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className="text-center mt-8 space-y-2">
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
              <button onClick={() => { setStep(1); setError(''); }} className="text-gray-500 hover:text-gray-900 font-medium transition-all text-sm">
                Change Email Address
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Code expires in 5 minutes</span>
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-gray-500 mt-2 text-center mb-8">
              Enter your brand new secure password below to finalize the reset.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 transition-all shadow-md disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Resetting Password...</span>
                  </span>
                ) : 'Confirm New Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
