'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (user) fetchSchedule();
  }, [selectedDate, user]);

  const fetchSchedule = async () => {
    try {
      const res = await apiClient.get(`/appointments?doctorId=${user.id}&date=${selectedDate}`);
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-1">View your daily appointments</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Appointments</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{appointments.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{appointments.filter(a => a.status === 'BOOKED').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="w-20 text-center">
                  <p className="text-lg font-bold text-blue-600">{new Date(apt.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-xs text-gray-500">{apt.duration} min</p>
                </div>
                <div className="flex-1 ml-4">
                  <h4 className="font-semibold text-gray-900">{apt.patient.firstName} {apt.patient.lastName}</h4>
                  <p className="text-sm text-gray-600">{apt.patient.patientNumber} • {apt.patient.phone}</p>
                  {apt.reason && <p className="text-sm text-gray-500 mt-1">{apt.reason}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
