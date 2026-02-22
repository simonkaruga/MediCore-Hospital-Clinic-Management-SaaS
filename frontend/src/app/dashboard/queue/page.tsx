'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export default function QueuePage() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await apiClient.get('/queue');
      setQueue(response.data);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    }
  };

  const callNext = async (id: string) => {
    try {
      await apiClient.patch(`/queue/${id}/call`);
      fetchQueue();
    } catch (error) {
      console.error('Failed to call patient:', error);
    }
  };

  const getTriageColor = (level?: string) => {
    const colors: any = {
      RED: 'bg-red-500',
      ORANGE: 'bg-orange-500',
      YELLOW: 'bg-yellow-500',
      GREEN: 'bg-green-500',
    };
    return colors[level || ''] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Queue</h1>
          <p className="text-gray-600 mt-1">Real-time patient queue management</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Waiting</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{queue.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">Avg Wait Time</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">15 min</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Served Today</p>
          <p className="text-2xl font-bold text-green-900 mt-1">0</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {queue.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Queue is empty</h3>
            <p className="text-gray-600">No patients waiting</p>
          </div>
        ) : (
          <div className="divide-y">
            {queue.map((entry, index) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl font-bold text-blue-900 text-lg">
                      #{index + 1}
                    </div>
                    {entry.triageLevel && (
                      <div className={`w-3 h-3 rounded-full ${getTriageColor(entry.triageLevel)}`}></div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">Patient #{entry.patientId.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{entry.department?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Waiting: {Math.floor((Date.now() - new Date(entry.joinedAt).getTime()) / 60000)} min</p>
                    </div>
                  </div>
                  <button
                    onClick={() => callNext(entry.id)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Call Next
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
