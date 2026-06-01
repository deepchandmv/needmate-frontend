import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(new URLSearchParams(location.search).get('q') || '');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isLoggedInRef = useRef(!!localStorage.getItem('token'));
  const intervalRef = useRef(null);

  useEffect(() => {
    setSearchQuery(new URLSearchParams(location.search).get('q') || '');
  }, [location.search]);

  const fetchUnread = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUnreadCount(0);
      document.title = 'NeedMate';
      isLoggedInRef.current = false;
      return;
    }
    isLoggedInRef.current = true;
    try {
      const res = await axios.get(`${API_BASE}/api/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!localStorage.getItem('token')) {
        setUnreadCount(0);
        document.title = 'NeedMate';
        return;
      }
      const count = Number(res.data.count) || 0;
      setUnreadCount(count);
      document.title = count > 0 ? `NeedMate (${count})` : 'NeedMate';
    } catch (e) {
      if (e.response?.status === 401) {
        setUnreadCount(0);
        document.title = 'NeedMate';
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUnreadCount(0);
      document.title = 'NeedMate';
      return;
    }
    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, 30000);

    // Pause polling when tab is hidden, resume when visible
    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      } else {
        fetchUnread();
        if (!intervalRef.current) intervalRef.current = setInterval(fetchUnread, 30000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [location.pathname, fetchUnread]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        setUnreadCount(0);
        document.title = 'NeedMate';
        isLoggedInRef.current = false;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else if (location.pathname === '/browse') {
      navigate('/browse');
    }
  }, [searchQuery, location.pathname, navigate]);

  const handleLogout = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setUnreadCount(0);
    document.title = 'NeedMate';
    isLoggedInRef.current = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  const navItems = useMemo(() => [
    { name: 'Home', path: '/dashboard', icon: <svg className="w-5 h-5 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
    { name: 'Browse Needs', path: '/browse', icon: <svg className="w-5 h-5 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { name: 'My Needs', path: '/my-needs', icon: <svg className="w-5 h-5 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg> },
    { name: 'My Tasks', path: '/my-tasks', icon: <svg className="w-5 h-5 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { name: 'Chat', path: '/chat', icon: <svg className="w-5 h-5 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg> },
  ], []);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')) || { name: 'Student' }; }
    catch { return { name: 'Student' }; }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">N</div>
            <span className="text-xl font-bold text-gray-900">NeedMate</span>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link key={item.name} to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all relative ${isActive ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                  {item.name === 'Chat' && unreadCount > 0 && (
                    <span className="absolute right-3 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4">
          <Link to="/post" className="w-full mb-4 flex items-center justify-center space-x-2 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition-all shadow-sm font-medium">
            <span>+</span><span>Post Need</span>
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center shadow-sm border border-gray-200 space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-all">
            <span className="text-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="w-96">
            <form onSubmit={handleSearchSubmit} className="relative">
              <button type="submit" className="absolute left-3 top-3.5 text-gray-400 hover:text-teal-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for tasks..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-sm" />
            </form>
          </div>
          <div className="flex items-center space-x-4 relative">
            <button onClick={() => setShowProfilePopup(!showProfilePopup)}
              className="flex items-center space-x-3 pl-4 cursor-pointer hover:bg-gray-50 py-2 pr-4 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm text-left">
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showProfilePopup ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {showProfilePopup && (<>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfilePopup(false)}></div>
                <div className="absolute right-0 top-16 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-[profileIn_0.2s_ease-out]">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-5 text-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{user.name}</p>
                        <p className="text-teal-100 text-xs font-medium">Student</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-3 p-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">College Email</p>
                        <p className="text-sm text-gray-800 font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Class / Course</p>
                        <p className="text-sm text-gray-800 font-medium">{user.student_class || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <style>{`
                  @keyframes profileIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
            </>)}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
