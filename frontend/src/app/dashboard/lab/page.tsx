'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export default function LabPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('PENDING');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [resultData, setResultData] = useState({ result: '', unit: '', referenceRange: '', isCritical: false });

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const res = await apiClient.get(`/lab/requests?status=${filter}`);
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch lab requests:', error);
    }
  };

  const submitResult = async () => {
    try {
      await apiClient.post('/lab/results', {
        requestId: selectedRequest.id,
        ...resultData,
      });
      setShowResultModal(false);
      setResultData({ result: '', unit: '', referenceRange: '', isCritical: false });
      fetchRequests();
    } catch (error) {
      console.error('Failed to submit result:', error);
    }
  };

  const pending = requests.filter(r => r.status === 'PENDING').length;
  const completed = requests.filter(r => r.status === 'COMPLETED').length;
  const critical = requests.filter(r => r.results?.some((res: any) => res.isCritical)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratory</h1>
          <p className="text-gray-600 mt-1">Manage lab requests and results</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'PENDING' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'COMPLETED' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Pending Tests</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Completed Today</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{completed}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Critical Results</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{critical}</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No {filter.toLowerCase()} lab requests</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {req.visit.patient.firstName} {req.visit.patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">Patient #: {req.visit.patient.patientNumber}</p>
                  <p className="text-sm text-gray-600">Requested by: Dr. {req.doctor.firstName} {req.doctor.lastName}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {req.status}
                  </span>
                  {req.urgency === 'STAT' && (
                    <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">STAT</span>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{new Date(req.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-purple-900 mb-1">Test: {req.testName}</h4>
                {req.testCode && <p className="text-sm text-purple-700">Code: {req.testCode}</p>}
                {req.notes && <p className="text-sm text-purple-700 mt-2">{req.notes}</p>}
              </div>

              {req.results && req.results.length > 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Results:</h4>
                  {req.results.map((result: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <p className="text-green-900">
                        <strong>Result:</strong> {result.result} {result.unit}
                        {result.isCritical && <span className="ml-2 text-red-600 font-bold">⚠️ CRITICAL</span>}
                      </p>
                      {result.referenceRange && (
                        <p className="text-green-700">Reference Range: {result.referenceRange}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : req.status === 'PENDING' && (
                <button
                  onClick={() => {
                    setSelectedRequest(req);
                    setShowResultModal(true);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-semibold transition-all"
                >
                  Enter Results
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Result Entry Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Enter Lab Results</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Result</label>
                <input
                  type="text"
                  value={resultData.result}
                  onChange={(e) => setResultData({ ...resultData, result: e.target.value })}
                  placeholder="e.g., 120"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                <input
                  type="text"
                  value={resultData.unit}
                  onChange={(e) => setResultData({ ...resultData, unit: e.target.value })}
                  placeholder="e.g., mg/dL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Range</label>
                <input
                  type="text"
                  value={resultData.referenceRange}
                  onChange={(e) => setResultData({ ...resultData, referenceRange: e.target.value })}
                  placeholder="e.g., 70-110 mg/dL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={resultData.isCritical}
                  onChange={(e) => setResultData({ ...resultData, isCritical: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Mark as Critical</label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowResultModal(false);
                  setResultData({ result: '', unit: '', referenceRange: '', isCritical: false });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitResult}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
