import React from 'react';

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card p-6 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      {[...Array(lines - 1)].map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 rounded mb-3" style={{ width: `${80 - i * 10}%` }}></div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-gray-100">
            {[...Array(columns)].map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonQuiz({ className = '' }) {
  return (
    <div className={`max-w-3xl mx-auto animate-pulse ${className}`}>
      {/* Question skeleton */}
      <div className="card p-8 mb-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>

      {/* Options skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStats({ count = 4, className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard({ className = '' }) {
  return (
    <div className={className}>
      {/* Stats cards */}
      <SkeletonStats count={4} className="mb-8" />

      {/* Recent activity section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left column - recent attempts */}
        <div className="lg:col-span-2">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <SkeletonTable rows={5} columns={3} />
        </div>

        {/* Right column - quick stats */}
        <div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonNotes({ count = 6, className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonAnalytics({ className = '' }) {
  return (
    <div className={className}>
      {/* Chart skeleton */}
      <div className="card p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <SkeletonStats count={3} />
    </div>
  );
}

export default {
  Card: SkeletonCard,
  Table: SkeletonTable,
  Quiz: SkeletonQuiz,
  Stats: SkeletonStats,
  Dashboard: SkeletonDashboard,
  Notes: SkeletonNotes,
  Analytics: SkeletonAnalytics,
};