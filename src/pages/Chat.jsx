import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Layout from '../components/Layout';
import RateModal from '../components/RateModal';
import axios from 'axios';
import API_BASE from '../config';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [engagements, setEngagements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeNeedId, setActiveNeedId] = useState(null); 
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; }
    catch { return {}; }
  }, []);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) return navigate('/login');
    const fetchMyNeeds = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/needs/my`, { headers: { Authorization: `Bearer ${token}` } });
        const chatEngagements = res.data.filter(n => n.status !== 'open');
        setEngagements(chatEngagements);
        if (chatEngagements.length > 0 && !activeNeedId) setActiveNeedId(chatEngagements[0].id);
      } catch (err) { console.error('Fetch engagements error:', err); }
    };
    fetchMyNeeds();
  }, [navigate]);

  const fetchMessages = useCallback(async (needId) => {
    if (!needId) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE}/api/messages/${needId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(res.data)) return prev;
        return res.data;
      });
    } catch (err) { console.error('Fetch messages error:', err); }
  }, []);

  useEffect(() => {
    if (!activeNeedId) return;
    fetchMessages(activeNeedId);
    const intervalId = setInterval(() => { fetchMessages(activeNeedId); }, 3000);
    return () => clearInterval(intervalId);
  }, [activeNeedId, fetchMessages]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeNeedId || isSending) return;
    setIsSending(true);
    try {
       const token = localStorage.getItem('token');
       await axios.post(`${API_BASE}/api/messages`, { needId: activeNeedId, message: newMessage }, { headers: { Authorization: `Bearer ${token}` } });
       setNewMessage('');
       await fetchMessages(activeNeedId);
    } catch (err) { console.error('Send message error:', err); }
    finally { setIsSending(false); }
  }, [newMessage, activeNeedId, isSending, fetchMessages]);

  const handleCompleteTask = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/needs/${activeNeedId}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsRateModalOpen(true);
      const res = await axios.get(`${API_BASE}/api/needs/my`, { headers: { Authorization: `Bearer ${token}` } });
      setEngagements(res.data.filter(n => n.status !== 'open'));
    } catch (err) { alert(err.response?.data?.error || 'Failed to complete task'); }
  }, [activeNeedId]);

  const activeNeed = useMemo(() => engagements.find(e => e.id === activeNeedId), [engagements, activeNeedId]);

  const { otherPersonName, otherPersonEmail, otherPersonClass, otherRating } = useMemo(() => {
    let name = 'User', email = '', cls = '', rating = 'New';
    if (activeNeed) {
      const isCreator = activeNeed.created_by === user.id;
      const selfAssigned = activeNeed.created_by === activeNeed.assigned_to;
      if (selfAssigned) {
        name = `${user.name || 'You'} (Self-assigned)`;
        const rc = activeNeed.creator_rating_count;
        rating = rc > 0 ? (activeNeed.creator_rating_sum / rc).toFixed(1) : 'New';
      } else {
        name = isCreator ? activeNeed.assigned_to_name : activeNeed.created_by_name;
        email = isCreator ? activeNeed.assigned_to_email : activeNeed.created_by_email;
        cls = isCreator ? activeNeed.assigned_to_class : activeNeed.created_by_class;
        const rs = isCreator ? activeNeed.assignee_rating_sum : activeNeed.creator_rating_sum;
        const rc = isCreator ? activeNeed.assignee_rating_count : activeNeed.creator_rating_count;
        rating = rc > 0 ? (rs / rc).toFixed(1) : 'New';
      }
    }
    return { otherPersonName: name, otherPersonEmail: email, otherPersonClass: cls, otherRating: rating };
  }, [activeNeed, user]);

  const inProgressEngagements = useMemo(() => engagements.filter(n => n.status !== 'completed'), [engagements]);
  const completedEngagements = useMemo(() => engagements.filter(n => n.status === 'completed'), [engagements]);

  const formatTimestamp = useCallback((ts) => {
    if (!ts) return '';
    const fixed = ts && !ts.endsWith('Z') ? ts.replace(' ', 'T') + 'Z' : ts;
    const d = new Date(fixed);
    return `${d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, []);

  return (
    <Layout>
      <RateModal isOpen={isRateModalOpen} onClose={() => setIsRateModalOpen(false)}
        onSubmit={async (rating) => {
          try {
            const tk = localStorage.getItem('token');
            await axios.post(`${API_BASE}/api/needs/${activeNeedId}/rate`, { rating }, { headers: { Authorization: `Bearer ${tk}` } });
            alert(`Thank you! Rating of ${rating} stars registered.`);
          } catch(e) { alert(e.response?.data?.error || 'Failed to submit rating.'); }
        }}
        title={activeNeed?.title || 'this task'}
      />
      <div className="h-[calc(100vh-10rem)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {engagements.length === 0 ? (
               <p className="text-gray-500 p-4 text-sm text-center">No active chats.</p>
            ) : (<>
                {inProgressEngagements.length > 0 && (<div>
                    <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 sticky top-0 z-10">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">In Progress</span>
                        <span className="ml-auto text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{inProgressEngagements.length}</span>
                      </div>
                    </div>
                    {inProgressEngagements.map(need => (
                      <div key={need.id} onClick={() => setActiveNeedId(need.id)}
                        className={`p-4 border-l-4 cursor-pointer transition-colors ${activeNeedId === need.id ? 'border-teal-500 bg-white' : 'border-transparent hover:bg-white'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-900 text-sm line-clamp-1">{need.title}</span>
                        </div>
                        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-yellow-100 text-yellow-800">{need.status.toUpperCase()}</span>
                      </div>
                    ))}
                </div>)}
                {completedEngagements.length > 0 && (<div>
                    <div className="px-4 py-3 bg-green-50 border-b border-green-100 border-t border-t-gray-100 sticky top-0 z-10">
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Completed</span>
                        <span className="ml-auto text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{completedEngagements.length}</span>
                      </div>
                    </div>
                    {completedEngagements.map(need => (
                      <div key={need.id} onClick={() => setActiveNeedId(need.id)}
                        className={`p-4 border-l-4 cursor-pointer transition-colors ${activeNeedId === need.id ? 'border-teal-500 bg-white' : 'border-transparent hover:bg-white/70'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-500 text-sm line-clamp-1">{need.title}</span>
                        </div>
                        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-800">COMPLETED</span>
                      </div>
                    ))}
                </div>)}
            </>)}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {!activeNeed ? (
             <div className="flex items-center justify-center h-full text-gray-500">Select an engagement to view chat</div>
          ) : (<>
              {/* Chat Header */}
              <div className="h-20 border-b border-gray-100 px-8 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex flex-col items-center justify-center text-teal-700 font-bold border border-teal-200">
                    {otherPersonName ? otherPersonName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center">
                      {otherPersonName || 'User'}
                      <span className="ml-2 text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {otherRating}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      {otherPersonEmail}{otherPersonClass ? ` • ${otherPersonClass}` : ''}{!otherPersonEmail && !otherPersonClass ? `Task: ${activeNeed.title}` : ''}
                    </p>
                  </div>
                </div>
                {activeNeed.status === 'in-progress' && (
                  <button onClick={handleCompleteTask} className="bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-teal-100">Mark as Completed</button>
                )}
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50 flex flex-col" style={{ scrollBehavior: 'smooth' }}>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-gray-500 space-y-4">
                       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                         <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                       </div>
                       <p>Start chatting regarding: {activeNeed.title}</p>
                    </div>
                ) : (<>
                    {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[70%]">
                        <div className={`p-4 rounded-2xl ${msg.sender_id === user.id ? 'bg-teal-600 text-white rounded-br-none shadow-md shadow-teal-600/20' : 'bg-white text-gray-900 rounded-bl-none shadow-sm border border-gray-100'}`}>
                            <p className="leading-relaxed">{msg.message}</p>
                        </div>
                        <p className={`text-xs mt-2 font-medium ${msg.sender_id === user.id ? 'text-right text-teal-600' : 'text-gray-500'}`}>
                            {msg.sender_name} • {formatTimestamp(msg.timestamp)}
                        </p>
                        </div>
                    </div>
                    ))}
                    <div ref={messagesEndRef} />
                </>)}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-gray-100 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={activeNeed.status === 'completed' ? 'Task completed. Read-only' : 'Type your message...'}
                    disabled={activeNeed.status === 'completed'}
                    className="flex-1 bg-gray-50 px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-inner disabled:opacity-50" />
                  <button type="submit" disabled={activeNeed.status === 'completed' || !newMessage.trim() || isSending}
                    className="w-14 h-14 bg-teal-600 text-white rounded-full disabled:opacity-50 hover:bg-teal-700 transition-colors shadow-md flex items-center justify-center transform hover:scale-105">
                    {isSending ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    )}
                  </button>
                </form>
              </div>
          </>)}
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
