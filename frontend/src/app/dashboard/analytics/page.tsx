'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/analytics/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Hospital performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Patients</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalPatients || 0}</p>
              <p className="text-blue-100 text-xs mt-2">+{stats?.newPatientsThisMonth || 0} this month</p>
            </div>
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">KES {(stats?.totalRevenue || 0).toLocaleString()}</p>
              <p className="text-green-100 text-xs mt-2">This month</p>
            </div>
            <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Appointments</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalAppointments || 0}</p>
              <p className="text-purple-100 text-xs mt-2">This month</p>
            </div>
            <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Bed Occupancy</p>
              <p className="text-3xl font-bold mt-2">{stats?.bedOccupancyRate || 0}%</p>
              <p className="text-orange-100 text-xs mt-2">{stats?.occupiedBeds || 0}/{stats?.totalBeds || 0} beds</p>
            </div>
            <svg className="w-12 h-12 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h2>
          <div className="space-y-3">
            {stats?.revenueByDay?.map((day: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{day.date}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(day.amount / (stats?.maxDailyRevenue || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                    KES {day.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Department Activity</h2>
          <div className="space-y-4">
            {stats?.departmentStats?.map((dept: any, idx: number) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                  <span className="text-sm text-gray-600">{dept.visits} visits</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-blue-600 font-semibold">{dept.prescriptions}</p>
                    <p className="text-gray-600">Prescriptions</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-purple-600 font-semibold">{dept.labTests}</p>
                    <p className="text-gray-600">Lab Tests</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-green-600 font-semibold">KES {dept.revenue?.toLocaleString()}</p>
                    <p className="text-gray-600">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Diagnoses</h2>
          <div className="space-y-3">
            {stats?.topDiagnoses?.map((diagnosis: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{diagnosis.name}</span>
                <span className="text-sm font-semibold text-blue-600">{diagnosis.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Medications</h2>
          <div className="space-y-3">
            {stats?.topMedications?.map((med: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{med.name}</span>
                <span className="text-sm font-semibold text-green-600">{med.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-700">Paid</span>
              <span className="text-lg font-bold text-green-600">{stats?.paymentStats?.paid || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-700">Partial</span>
              <span className="text-lg font-bold text-yellow-600">{stats?.paymentStats?.partial || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-red-700">Pending</span>
              <span className="text-lg font-bold text-red-600">{stats?.paymentStats?.pending || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
