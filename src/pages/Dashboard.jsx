import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import API_BASE from '../config';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [recommended, setRecommended] = useState([]);
  const [myEngagements, setMyEngagements] = useState([]);
  const [user, setUser] = useState(null);
  const [userMe, setUserMe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!u || !token) {
      navigate('/login');
      return;
    }
    setUser(u);

    const fetchData = async () => {
      try {
        const [resRec, resMe, resMy] = await Promise.all([
          axios.get(`${API_BASE}/api/needs`),
          axios.get(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/api/needs/my`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setRecommended(resRec.data.filter(n => n.status === 'open' && n.created_by !== u.id).slice(0, 4));
        setUserMe(resMe.data);
        setMyEngagements(resMy.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchData();
  }, [navigate]);

  // Memoized metrics — only recalculate when myEngagements or user change
  const activeCount = useMemo(() => myEngagements.filter(n => n.status === 'in-progress').length, [myEngagements]);
  const totalEarnings = useMemo(() => myEngagements
    .filter(n => n.status === 'completed' && n.assigned_to === user?.id)
    .reduce((sum, n) => sum + Number(n.reward), 0), [myEngagements, user]);

  return (
    <Layout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Student'}! <span className="inline-block"><svg className="w-6 h-6 text-yellow-500 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span></h1>
          <p className="text-gray-500 mt-2">Here's what's happening on campus today.</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Side Main Content */}
        <div className="flex-1 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-sm">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{myEngagements.filter(n => n.status === 'completed' && n.assigned_to === user?.id).length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-sm">Active Engagements</p>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalEarnings}</p>
              </div>
            </div>
          </div>

          {/* Recommended Needs */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recommended Needs</h2>
              <Link to="/browse" className="text-teal-600 font-medium text-sm hover:text-teal-700">View All</Link>
            </div>
            {recommended.length === 0 ? (
               <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100">
                 No active needs right now. Be the first to post!
               </div>
            ) : (
                <div className="grid grid-cols-2 gap-6">
                {recommended.map(need => (
                    <div key={need.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                            TASK
                        </span>
                        <span className="text-lg font-bold text-teal-600">₹{need.reward}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">{need.title}</h3>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">{need.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 relative">
                            {need.created_by_name?.charAt(0).toUpperCase()}
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full text-[8px] flex items-center px-1 border border-gray-100 font-bold shadow-sm">
                              <span className="text-yellow-400 mr-[1px]">★</span>
                              {need.creator_rating_count > 0 ? (need.creator_rating_sum / need.creator_rating_count).toFixed(1) : 'New'}
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{need.created_by_name}</span>
                        </div>
                        <Link to="/browse" className="bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        View
                        </Link>
                    </div>
                    </div>
                ))}
                </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 space-y-6">
          <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="font-medium text-gray-300 mb-1">Your Rating</h3>
            <div className="flex items-end space-x-2 mb-1">
              <span className="text-4xl font-bold">{userMe?.rating_count > 0 ? (userMe.rating_sum / userMe.rating_count).toFixed(1) : '-'}</span>
              <span className="text-gray-400 pb-1">/ 5.0 </span>
            </div>
            {userMe?.rating_count > 0 && (
              <p className="text-xs text-gray-400 mb-4 opacity-80">(Based on {userMe.rating_count} student review{userMe.rating_count !== 1 ? 's' : ''})</p>
            )}
            <p className="text-sm text-gray-400 mt-2 flex items-center">
              {userMe?.rating_count > 0 ? (
                <><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Top 10% of campus! Keep it up.</>
              ) : (
                'Complete tasks to earn trust.'
              )}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Your Engagements</h3>
            {myEngagements.filter(n => n.status === 'in-progress').length === 0 ? (
                <p className="text-sm text-gray-500">No active engagements right now.</p>
            ) : (
              myEngagements.filter(n => n.status === 'in-progress').slice(0, 4).map(need => (
                <div key={need.id} className="p-4 rounded-xl border border-teal-100 bg-teal-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      need.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      need.status === 'in-progress' ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {need.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm mb-3 line-clamp-1" title={need.title}>
                    {need.title}
                  </p>
                  
                  {need.status === 'in-progress' && (
                    <Link to="/chat" className="w-full mt-2 block text-center bg-white border border-teal-200 text-teal-700 text-xs font-medium py-2 rounded-lg hover:bg-teal-50 transition-colors">
                      Open Chat
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
