import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      ),
      title: 'Post a Need',
      desc: 'Describe your task, set a reward, and let campus peers compete to help you out.',
      color: 'from-teal-500 to-emerald-500',
      bg: 'bg-teal-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      ),
      title: 'Browse & Accept',
      desc: 'Discover open tasks that match your skills and availability. Accept in one click.',
      color: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      ),
      title: 'In-App Chat',
      desc: 'Coordinate details, share updates, and stay connected through real-time messaging.',
      color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
      ),
      title: 'Ratings & Trust',
      desc: 'Build your reputation through peer ratings. Higher trust means more opportunities.',
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      ),
      title: 'Verified Students',
      desc: 'University email verification ensures a safe, trusted community of real students.',
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
      title: 'Earn Rewards',
      desc: 'Complete tasks and earn rewards set by peers. Turn your free time into value.',
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ─── Navbar ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/40 border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-200 group-hover:shadow-teal-300 transition-shadow">
              N
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              Need<span className="text-teal-600">Mate</span>
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-700 hover:bg-white/60'}`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-200 hover:shadow-teal-300 hover:scale-[1.03] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-teal-100/60 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-emerald-100/40 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '10s' }} />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-teal-700">Your Campus Concierge Platform</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Get things done,{' '}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              together.
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            NeedMate connects students who need help with peers who can deliver. Post tasks, earn rewards, build trust — all within your campus community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              id="hero-cta-register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xl shadow-teal-200/60 hover:shadow-teal-300/80 hover:scale-[1.03] transition-all flex items-center justify-center space-x-2"
            >
              <span>Create Free Account</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              to="/login"
              id="hero-cta-login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50 transition-all flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 lg:py-28 px-6 bg-gray-50/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-teal-600">Features</span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Everything you need on campus
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
              From posting errands to earning rewards — NeedMate covers the full lifecycle of peer-to-peer task management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-5 text-gray-700 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 lg:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-teal-600">How it works</span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Three simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create an account using your university email. Verify with a secure OTP.', emoji: '🎓' },
              { step: '02', title: 'Post or Browse', desc: 'Need help? Post a task with a reward. Want to earn? Browse available needs.', emoji: '📋' },
              { step: '03', title: 'Chat & Complete', desc: 'Coordinate via in-app chat, complete the task, and earn your reward.', emoji: '🤝' },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl flex items-center justify-center text-4xl shadow-sm border border-teal-100">
                  {s.emoji}
                </div>
                <span className="text-xs font-bold text-teal-600 tracking-widest uppercase">Step {s.step}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 -right-5 text-gray-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to join your campus community?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
              Sign up in under a minute — verified, secure, and completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                id="cta-register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-xl hover:scale-[1.03] transition-all"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                id="cta-login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base border border-gray-600 text-gray-300 hover:border-teal-400 hover:text-white transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">N</div>
            <span className="font-semibold text-gray-600">NeedMate</span>
          </div>
          <p>© {new Date().getFullYear()} NeedMate. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
