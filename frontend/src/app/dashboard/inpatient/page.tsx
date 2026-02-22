'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export default function InpatientPage() {
  const [beds, setBeds] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [showDischarge, setShowDischarge] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [dischargeSummary, setDischargeSummary] = useState('');

  useEffect(() => {
    fetchBeds();
    fetchAdmissions();
  }, []);

  const fetchBeds = async () => {
    try {
      const response = await apiClient.get('/inpatient/beds');
      setBeds(response.data);
    } catch (error) {
      console.error('Failed to fetch beds:', error);
    }
  };

  const fetchAdmissions = async () => {
    try {
      const response = await apiClient.get('/inpatient/admissions');
      setAdmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch admissions:', error);
    }
  };

  const handleDischarge = async () => {
    try {
      await apiClient.patch(`/inpatient/admissions/${selectedAdmission.id}/discharge`, {
        dischargeSummary,
      });
      setShowDischarge(false);
      setDischargeSummary('');
      fetchBeds();
      fetchAdmissions();
    } catch (error) {
      console.error('Failed to discharge:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      AVAILABLE: 'bg-green-500',
      OCCUPIED: 'bg-red-500',
      RESERVED: 'bg-yellow-500',
      CLEANING: 'bg-blue-500',
      MAINTENANCE: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const activeAdmissions = admissions.filter(a => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inpatient Management</h1>
          <p className="text-gray-600 mt-1">Manage beds and patient admissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Available</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{beds.filter(b => b.status === 'AVAILABLE').length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Occupied</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{beds.filter(b => b.status === 'OCCUPIED').length}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
          <p className="text-sm text-indigo-700 font-medium">Active Admissions</p>
          <p className="text-2xl font-bold text-indigo-900 mt-1">{activeAdmissions.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Occupancy Rate</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{beds.length > 0 ? Math.round((beds.filter(b => b.status === 'OCCUPIED').length / beds.length) * 100) : 0}%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Bed Map</h3>
        {beds.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No beds configured</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {beds.map((bed) => (
              <div
                key={bed.id}
                className="relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg"
                style={{
                  borderColor: bed.status === 'OCCUPIED' ? '#ef4444' : bed.status === 'AVAILABLE' ? '#22c55e' : '#eab308',
                  backgroundColor: bed.status === 'OCCUPIED' ? '#fef2f2' : bed.status === 'AVAILABLE' ? '#f0fdf4' : '#fefce8',
                }}
              >
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${getStatusColor(bed.status)}`}></div>
                  <p className="font-bold text-gray-900">{bed.wardName}</p>
                  <p className="text-sm text-gray-600">Bed {bed.bedNumber}</p>
                  <p className="text-xs text-gray-500 mt-2">{bed.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Active Admissions</h3>
        {activeAdmissions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No active admissions</p>
        ) : (
          <div className="space-y-4">
            {activeAdmissions.map((admission) => (
              <div key={admission.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{admission.patient.firstName} {admission.patient.lastName}</h4>
                    <p className="text-sm text-gray-600">Patient #: {admission.patient.patientNumber}</p>
                    <p className="text-sm text-gray-600">Bed: {admission.bed.wardName} - {admission.bed.bedNumber}</p>
                    <p className="text-sm text-gray-600">Admitted: {new Date(admission.admissionDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-700 mt-2"><strong>Reason:</strong> {admission.admissionReason}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAdmission(admission);
                      setShowDischarge(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                  >
                    Discharge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDischarge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Discharge Summary</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Patient: <strong>{selectedAdmission?.patient.firstName} {selectedAdmission?.patient.lastName}</strong></p>
              <p className="text-sm text-gray-600">Admission Date: <strong>{new Date(selectedAdmission?.admissionDate).toLocaleDateString()}</strong></p>
            </div>
            <textarea
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              placeholder="Enter discharge summary, final diagnosis, treatment given, follow-up instructions..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDischarge(false);
                  setDischargeSummary('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDischarge}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                Discharge Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
