import React, { useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import API_BASE from '../config';
import { useNavigate } from 'react-router-dom';

const PostNeed = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'task',
    description: '',
    reward: '',
    deadline: ''
  });
  const navigate = useNavigate();

  const handlePost = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/needs`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Need posted successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post need');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a Need</h1>
        <p className="text-gray-500 mt-2">Get help from the community by posting a task.</p>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                placeholder="E.g. Need to borrow a Scientific Calculator"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                placeholder="Give more details about what you need..."
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reward (₹)</label>
                <input 
                  type="number"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="E.g. 50"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input 
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-80">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h3 className="font-bold text-xl text-gray-900 mb-4">Ready to Post?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Make sure your title is clear and the reward is fair representation of effort!
            </p>
            <div className="space-y-3">
              <button 
                onClick={handlePost} 
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
              >
                Publish Need
              </button>
              <button 
                className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostNeed;
