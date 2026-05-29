import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import API_BASE from '../config';
import { useLocation } from 'react-router-dom';

const BrowseNeeds = () => {

  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState(null);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = (searchParams.get('q') || '').toLowerCase();

  useEffect(() => {
    fetchNeeds();
  }, [q]);

  const fetchNeeds = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/needs`);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      let filtered = res.data.filter(n => n.status === 'open' && n.created_by !== currentUser?.id);
      
      if (q) {
        filtered = filtered.filter(n => 
          n.title.toLowerCase().includes(q) || 
          n.description.toLowerCase().includes(q)
        );
      }
      setNeeds(filtered);
    } catch (err) {
      console.error('Failed to fetch needs', err);
    }
  }, [q]);

  const handleHelpOut = useCallback(async (needId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/needs/${needId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('You have accepted this task!');
      fetchNeeds(); // Refresh list to reflect changes
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept task');
    }
  }, [fetchNeeds]);

  const formatTimestamp = useCallback((ts) => {
    if (!ts) return 'N/A';
    const fixed = ts.endsWith('Z') ? ts : ts.replace(' ', 'T') + 'Z';
    const d = new Date(fixed);
    return `${d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, []);

  const getUserRating = useCallback((need) => {
    if (!need.creator_rating_count || need.creator_rating_count === 0) return null;
    return (need.creator_rating_sum / need.creator_rating_count).toFixed(1);
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Needs</h1>
        <p className="text-gray-500 mt-2">Find tasks and help out your peers.</p>
      </div>

      {/* Details Modal */}
      {selectedNeed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNeed(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          
          {/* Modal */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-[modalIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-6 text-white relative">
              <button 
                onClick={() => setSelectedNeed(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-xl font-bold pr-8 leading-snug">{selectedNeed.title}</h3>
              <div className="flex items-center space-x-3 mt-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wide">
                  {selectedNeed.category || 'Task'}
                </span>
                <span className="text-lg font-bold">₹{selectedNeed.reward}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Description */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedNeed.description}</p>
              </div>

              <hr className="border-gray-100" />

              {/* Posted By Section */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Posted By</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-lg font-bold border-2 border-teal-200">
                    {selectedNeed.created_by_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{selectedNeed.created_by_name}</p>
                    <p className="text-xs text-gray-400 font-medium">{selectedNeed.created_by_email}</p>
                    {selectedNeed.created_by_class && (
                      <p className="text-xs text-teal-600 font-medium mt-0.5">{selectedNeed.created_by_class}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {getUserRating(selectedNeed) ? (
                      <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(getUserRating(selectedNeed)) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-bold text-yellow-700 ml-1">{getUserRating(selectedNeed)}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">New User</span>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Posted On</p>
                  <p className="text-sm font-bold text-gray-800">{formatTimestamp(selectedNeed.created_at)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
                  <p className="text-sm font-bold text-gray-800">{selectedNeed.deadline ? formatTimestamp(selectedNeed.deadline) : 'No deadline'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex space-x-3">
              <button 
                onClick={() => setSelectedNeed(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleHelpOut(selectedNeed.id);
                  setSelectedNeed(null);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-md shadow-teal-200"
              >
                Help Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for modal animation */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {needs.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100">
            <p className="text-gray-500">No needs found in this category.</p>
          </div>
        ) : (
          needs.map(need => (
            <div key={need.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col group">
              {/* Green box — task info + actions side by side */}
              <div className="bg-gray-100 relative overflow-hidden px-5 py-4">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 opacity-20"></div>
                <div className="relative z-10">
                  {/* Top row: TASK badge + Amount */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-md bg-white/90 shadow-sm text-blue-700 tracking-wide">
                      TASK
                    </span>
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-base font-bold text-teal-700 shadow-sm">
                      ₹{need.reward}
                    </span>
                  </div>
                  {/* Bottom row: Title on left + Buttons on right */}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-700 transition-colors truncate">{need.title}</h3>
                    {need.status === 'open' ? (
                      <div className="flex items-center space-x-2 shrink-0">
                        <button 
                          onClick={() => setSelectedNeed(need)}
                          className="bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-900 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm border border-white/50 hover:shadow-md"
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => handleHelpOut(need.id)}
                          className="bg-teal-600 text-white hover:bg-teal-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                        >
                          Help Out
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-yellow-100 text-yellow-800 shrink-0">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* White section — description & user info */}
              <div className="px-5 py-4 flex-1 flex flex-col">
                <p className="text-gray-500 text-sm mb-3 flex-1 line-clamp-2 leading-relaxed">{need.description}</p>
                
                <div className="flex items-center border-t border-gray-100 pt-3">
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600 relative">
                    {need.created_by_name?.charAt(0).toUpperCase()}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full text-[7px] flex items-center px-0.5 border border-gray-100 font-bold shadow-sm">
                      <span className="text-yellow-400 mr-[1px]">★</span>
                      {need.creator_rating_count > 0 ? (need.creator_rating_sum / need.creator_rating_count).toFixed(1) : 'New'}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 ml-2">{need.created_by_name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default BrowseNeeds;
