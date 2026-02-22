'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPatient();
    }
  }, [params.id]);

  const fetchPatient = async () => {
    try {
      const response = await apiClient.get(`/patients/${params.id}`);
      setPatient(response.data);
    } catch (error) {
      console.error('Failed to fetch patient:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Patient not found</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-600 mt-1">{patient.patientNumber}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/dashboard/patients/${patient.id}/edit`)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
          >
            Edit Patient
          </button>
          <button
            onClick={() => router.push(`/dashboard/emr?patientId=${patient.id}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
          >
            Start Consultation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">National ID</p>
                <p className="font-semibold text-gray-900">{patient.nationalId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-semibold text-gray-900">
                  {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-semibold text-gray-900">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{patient.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-900">{patient.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {(patient.allergies || patient.chronicConditions) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Medical Alerts</h2>
              {patient.allergies && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Allergies</p>
                  <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full">
                    {patient.allergies}
                  </span>
                </div>
              )}
              {patient.chronicConditions && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Chronic Conditions</p>
                  <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                    {patient.chronicConditions}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/dashboard/emr?patientId=${patient.id}`)}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-medium text-left"
              >
                New Consultation
              </button>
              <button
                onClick={() => router.push(`/dashboard/appointments?patientId=${patient.id}`)}
                className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 font-medium text-left"
              >
                Book Appointment
              </button>
              <button
                onClick={() => router.push(`/dashboard/lab?patientId=${patient.id}`)}
                className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 font-medium text-left"
              >
                Lab Request
              </button>
              <button
                onClick={() => router.push(`/dashboard/billing?patientId=${patient.id}`)}
                className="w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 font-medium text-left"
              >
                View Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
