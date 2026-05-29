import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import RateModal from '../components/RateModal';
import axios from 'axios';
import API_BASE from '../config';
import { Link } from 'react-router-dom';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [rateModalData, setRateModalData] = useState(null); 
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  }, []);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE}/api/needs/my`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      // Only keep accepted tasks (where user is the assignee)
      setTasks(res.data.filter(n => n.assigned_to === user?.id));
    } catch (err) {
      console.error('Failed to fetch my tasks', err);
    }
  }, [user]);

  const handleDecline = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to decline this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/needs/${id}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to decline task');
    }
  }, [fetchMyTasks]);

  const handleComplete = useCallback(async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/needs/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete task');
    }
  }, [fetchMyTasks]);

  const activeTasks = useMemo(() => tasks.filter(t => t.status === 'in-progress'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed'), [tasks]);
  const totalEarned = useMemo(() => completedTasks.reduce((sum, t) => sum + Number(t.reward), 0), [completedTasks]);

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
            alert('Thank you! Rating has been assigned to the user profile.');
            fetchMyTasks();
          } catch(e) {
            alert(e.response?.data?.error || 'Failed to submit rating.');
          }
        }}
        title={rateModalData?.title || 'this interaction'}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500 mt-2">Manage your accepted tasks<br/>Track tasks you've accepted to help others</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 mb-1 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ACCEPTED</h3>
            <p className="text-3xl font-bold text-gray-900">{String(activeTasks.length).padStart(2,'0')}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 mb-1 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> COMPLETED</h3>
            <p className="text-3xl font-bold text-gray-900">{String(completedTasks.length).padStart(2,'0')}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 mb-1 flex items-center"><span className="mr-2">₹</span> EARNED</h3>
            <p className="text-3xl font-bold text-gray-900">₹{totalEarned}</p>
         </div>
      </div>

      <div className="space-y-8">
        {/* ACCEPTED SECTION */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> ACCEPTED TASKS</h2>
          <div className="space-y-4">
            {activeTasks.length === 0 ? <p className="text-gray-500 text-sm">No active tasks.</p> : activeTasks.map(task => (
                <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-2">
                      <span className="bg-green-100 text-green-700 font-bold text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider">ACCEPTED</span>
                      <span className="font-bold text-lg text-gray-900">₹{parseFloat(task.reward).toFixed(2)}</span>
                   </div>
                   <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                   <p className="text-gray-500 text-sm mt-2 mb-4">{task.description}</p>
                   
                   <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-auto">
                      <div className="text-sm text-gray-500 font-medium flex items-center space-x-4">
                        <span>Posted by: {task.created_by_name}</span>
                        <Link to="/chat" className="text-teal-600 font-medium hover:underline flex items-center">
                          <span className="text-sm">💬 Reply in Chat</span>
                        </Link>
                      </div>
                      <div className="flex space-x-3">
                         <button onClick={() => handleDecline(task.id)} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center transition-colors">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> Decline
                         </button>
                         <button onClick={() => handleComplete(task.id)} className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Mark Complete
                         </button>
                      </div>
                   </div>
                </div>
            ))}
          </div>
        </div>

        {/* COMPLETED SECTION */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center"><span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span> COMPLETED TASKS</h2>
          <div className="space-y-4">
          {completedTasks.length === 0 ? <p className="text-gray-500 text-sm">No completed tasks.</p> : completedTasks.map(task => {
                const myRating = task.rated_by_assignee;
                return (
                <div key={task.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col opacity-75 hover:opacity-100 transition-opacity">
                   <div className="flex justify-between items-start mb-2">
                      <span className="bg-gray-200 text-gray-500 font-bold text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider">COMPLETED</span>
                      <span className="font-bold text-lg text-gray-400">₹{parseFloat(task.reward).toFixed(2)}</span>
                   </div>
                   <h3 className="font-bold text-lg text-gray-500">{task.title}</h3>
                   <p className="text-gray-400 text-sm mt-2 mb-4">{task.description}</p>
                   
                   <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-auto">
                      <div className="text-sm text-gray-400 font-medium">Posted by: {task.created_by_name}</div>
                      {myRating ? (
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                          <span className="text-xs font-medium text-gray-400">Your rating:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <svg key={star} className={`w-4 h-4 ${star <= myRating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm font-bold text-yellow-600">{myRating}/5</span>
                        </div>
                      ) : (
                        <button onClick={() => setRateModalData(task)} className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                           <span className="mr-1 text-yellow-300">☆</span> Rate Poster
                        </button>
                      )}
                   </div>
                </div>
                );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default MyTasks;
