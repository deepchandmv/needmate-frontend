import React, { useState } from 'react';

const RateModal = ({ isOpen, onClose, onSubmit, title }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-fade-in-up">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Rate Your Experience</h2>
        <p className="text-center text-gray-500 text-sm mb-8">{title}</p>
        
        <div className="flex justify-center space-x-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-5xl transition-colors ${
                star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </button>
          ))}
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onSubmit(rating); onClose(); setRating(0); }}
            disabled={rating === 0}
            className="flex-1 py-3 px-4 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateModal;
