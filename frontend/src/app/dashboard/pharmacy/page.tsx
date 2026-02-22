'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import PrintPrescription from '@/components/PrintPrescription';

interface Prescription {
  id: string;
  status: string;
  createdAt: string;
  notes?: string;
  items: {
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
  }[];
  visit: {
    visitNumber: string;
    patient: {
      firstName: string;
      lastName: string;
      patientNumber: string;
    };
  };
  doctor: {
    firstName: string;
    lastName: string;
  };
}

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [printPrescription, setPrintPrescription] = useState<any>(null);

  useEffect(() => {
    fetchPrescriptions();
    fetchInventory();
  }, [filter]);

  const fetchPrescriptions = async () => {
    try {
      const res = await apiClient.get(`/pharmacy/prescriptions?status=${filter}`);
      setPrescriptions(res.data);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await apiClient.get('/pharmacy/inventory');
      setInventory(res.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const dispensePrescription = async (id: string) => {
    try {
      await apiClient.patch(`/pharmacy/prescriptions/${id}/dispense`);
      fetchPrescriptions();
    } catch (error) {
      console.error('Failed to dispense:', error);
    }
  };

  const pending = prescriptions.filter(p => p.status === 'PENDING').length;
  const dispensed = prescriptions.filter(p => p.status === 'DISPENSED').length;
  const lowStock = inventory.filter(item => item.quantity <= 50).length;
  const outOfStock = inventory.filter(item => item.quantity === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy</h1>
          <p className="text-gray-600 mt-1">Manage prescriptions and dispensing</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'PENDING' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('DISPENSED')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'DISPENSED' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Dispensed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
          <p className="text-sm text-teal-700 font-medium">Pending Prescriptions</p>
          <p className="text-2xl font-bold text-teal-900 mt-1">{pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Dispensed Today</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{dispensed}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Low Stock Items</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{lowStock}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Out of Stock</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{outOfStock}</p>
        </div>
      </div>

      {lowStock > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-orange-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-orange-800 font-semibold">Stock Alert</h3>
              <p className="text-orange-700 text-sm mt-1">{lowStock} items are running low. Please reorder soon.</p>
              <div className="mt-2 space-y-1">
                {inventory.filter(item => item.quantity <= 50 && item.quantity > 0).slice(0, 5).map((item, idx) => (
                  <p key={idx} className="text-sm text-orange-600">• {item.name}: {item.quantity} {item.unit} remaining</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {outOfStock > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold">Critical: Out of Stock</h3>
              <p className="text-red-700 text-sm mt-1">{outOfStock} items are out of stock. Immediate action required!</p>
              <div className="mt-2 space-y-1">
                {inventory.filter(item => item.quantity === 0).slice(0, 5).map((item, idx) => (
                  <p key={idx} className="text-sm text-red-600 font-medium">• {item.name}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No {filter.toLowerCase()} prescriptions</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rx.visit.patient.firstName} {rx.visit.patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">Patient #: {rx.visit.patient.patientNumber}</p>
                  <p className="text-sm text-gray-600">Visit #: {rx.visit.visitNumber}</p>
                  <p className="text-sm text-gray-600">Prescribed by: Dr. {rx.doctor.firstName} {rx.doctor.lastName}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    rx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {rx.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">{new Date(rx.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Medications:</h4>
                <div className="space-y-3">
                  {rx.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{item.drugName}</span>
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.dosage} • {item.frequency} • {item.duration}
                      </p>
                      {item.instructions && (
                        <p className="text-sm text-gray-500 mt-1 italic">{item.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {rx.notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900"><strong>Notes:</strong> {rx.notes}</p>
                </div>
              )}

              {rx.status === 'PENDING' && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setPrintPrescription(rx)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-all"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => dispensePrescription(rx.id)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 font-semibold transition-all"
                  >
                    Dispense Medication
                  </button>
                </div>
              )}
              {rx.status === 'DISPENSED' && (
                <button
                  onClick={() => setPrintPrescription(rx)}
                  className="mt-4 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-all"
                >
                  Print
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {printPrescription && (
        <PrintPrescription
          prescription={printPrescription}
          patient={printPrescription.visit.patient}
          onClose={() => setPrintPrescription(null)}
        />
      )}
    </div>
  );
}
