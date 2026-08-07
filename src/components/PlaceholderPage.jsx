import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlaceholderPage({ title }) {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden flex flex-col items-center justify-center p-16 min-h-[400px]">
        <div className="w-24 h-24 bg-input-bg rounded-full flex items-center justify-center mb-6 border border-border-orange/20 shadow-sm">
          <span className="text-5xl">🚧</span>
        </div>
        <h2 className="text-2xl font-extrabold text-sidebar mb-2">{title}</h2>
        <p className="text-text-secondary text-center max-w-md mb-8">
          This feature is currently under construction. Please check back later!
        </p>
        <button 
          onClick={() => navigate(-1)}
          className="bg-button-orange hover:bg-hover-orange text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
