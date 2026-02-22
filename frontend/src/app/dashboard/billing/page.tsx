'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get('/billing/invoices');
      setInvoices(res.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  const filteredInvoices = filter === 'ALL' ? invoices : invoices.filter(inv => inv.status === filter);
  const todayRevenue = invoices.filter(inv => 
    new Date(inv.createdAt).toDateString() === new Date().toDateString()
  ).reduce((sum, inv) => sum + inv.paidAmount, 0);
  const pending = invoices.filter(inv => inv.status === 'PENDING').length;
  const partial = invoices.filter(inv => inv.status === 'PARTIAL').length;
  const paid = invoices.filter(inv => inv.status === 'PAID').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-1">Manage invoices and payments</p>
        </div>
        <div className="flex space-x-2">
          {['ALL', 'PENDING', 'PARTIAL', 'PAID'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${filter === status ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Today Revenue</p>
          <p className="text-2xl font-bold text-green-900 mt-1">KES {todayRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Pending</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{pending}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">Partial</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{partial}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Paid</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{paid}</p>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {invoice.visit.patient.firstName} {invoice.visit.patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">Invoice #: {invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">Patient #: {invoice.visit.patient.patientNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">{new Date(invoice.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Items:</h4>
                <div className="space-y-2">
                  {invoice.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.description} (x{item.quantity})</span>
                      <span className="font-medium text-gray-900">KES {item.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total: <span className="font-bold text-gray-900">KES {invoice.totalAmount.toLocaleString()}</span></p>
                    <p className="text-sm text-gray-600">Paid: <span className="font-bold text-green-600">KES {invoice.paidAmount.toLocaleString()}</span></p>
                    {invoice.paidAmount < invoice.totalAmount && (
                      <p className="text-sm text-gray-600">Balance: <span className="font-bold text-red-600">KES {(invoice.totalAmount - invoice.paidAmount).toLocaleString()}</span></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
