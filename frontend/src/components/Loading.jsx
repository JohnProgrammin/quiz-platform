import React from 'react';

function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
      <div className="text-center">
        {/* Simple spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
        </div>

        {/* Loading text */}
        <p className="text-slate font-semibold text-base">Loading...</p>
      </div>
    </div>
  );
}

export default Loading;
