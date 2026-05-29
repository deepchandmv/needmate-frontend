import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import RateModal from '../components/RateModal';
import axios from 'axios';
import API_BASE from '../config';
import { Link } from 'react-router-dom';

const MyNeeds = () => {
  const [needs, setNeeds] = useState([]);
  const [rateModalData, setRateModalData] = useState(null); // stores {id, title}
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  }, []);

  useEffect(() => {
    fetchMyNeeds();
  }, []);

  const fetchMyNeeds = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE}/api/needs/my`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      setNeeds(res.data.filter(n => n.created_by === user?.id));
    } catch (err) {
      console.error('Failed to fetch my needs', err);
    }
  }, [user]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this need?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/needs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyNeeds();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete need');
    }
  }, [fetchMyNeeds]);

  return (
    <Layout>
      <RateModal 
        isOpen={!!rateModalData} 
        onClose={() => setRateModalData(null)} 
        onSubmit={async (rating) => {
          try {
            const tk = localStorage.getItem('token');
            await axios.post(`${API_BASE}/api/needs/${rateModalData.id}/rate`, { rating }, {
               headers: { Authorization: `Bearer ${tk}` }
            });
            alert(`Thank you! Rating has been assigned to the user profile.`);
          } catch(e) {
            alert(e.response?.data?.error || 'Failed to submit rating.');
          }
        }}
        title={rateModalData?.title || 'this engagement'}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Needs</h1>
        <p className="text-gray-500 mt-2">Manage all the tasks you have posted or accepted to help with.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {needs.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100">
            <p className="text-gray-500">You don't have any engagements yet. Start by posting or accepting a need!</p>
          </div>
        ) : (
          needs.map(need => {
            return (
            <div key={need.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700">
                      TASK
                    </span>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                      need.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      need.status === 'in-progress' ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {need.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-teal-600">₹{need.reward}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{need.title}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{need.description}</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                <span className="text-xs font-bold text-gray-500">
                  You posted this
                </span>
                <div className="flex items-center space-x-3">
                  {need.status !== 'completed' && (
                    <button onClick={() => handleDelete(need.id)} className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Delete
                    </button>
                  )}
                  {need.status === 'in-progress' && (
                    <Link to="/chat" className="bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Go to Chat
                    </Link>
                  )}
                  {need.status === 'completed' && (
                    <button onClick={() => setRateModalData({id: need.id, title: need.title})} className="bg-teal-700 text-white hover:bg-teal-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
                      <span className="mr-1 text-yellow-300">★</span> Rate Helper
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </Layout>
  );
};

export default MyNeeds;
