'use client';

export default function PrintInvoice({ invoice, patient, onClose }: any) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between print:hidden">
          <h2 className="text-2xl font-bold text-gray-900">Print Invoice</h2>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-8" id="invoice-content">
          <div className="border-2 border-gray-300 rounded-xl p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-600">MediCore Hospital</h1>
                <p className="text-gray-600 mt-2">Nairobi, Kenya</p>
                <p className="text-gray-600">+254700000000</p>
                <p className="text-gray-600">info@medicore.co.ke</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-gray-600 mt-2">#{invoice.invoiceNumber}</p>
                <p className="text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-3">Bill To:</h3>
              <p className="font-semibold text-gray-900">{patient?.firstName} {patient?.lastName}</p>
              <p className="text-gray-600">{patient?.patientNumber}</p>
              <p className="text-gray-600">{patient?.phone}</p>
              {patient?.address && <p className="text-gray-600">{patient.address}</p>}
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 text-gray-700">Description</th>
                  <th className="text-right py-3 text-gray-700">Quantity</th>
                  <th className="text-right py-3 text-gray-700">Unit Price</th>
                  <th className="text-right py-3 text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">KES {item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 text-right font-semibold">KES {item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">KES {invoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Paid:</span>
                  <span className="font-semibold text-green-600">KES {invoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-900">Balance Due:</span>
                  <span className="text-lg font-bold text-red-600">KES {(invoice.totalAmount - invoice.paidAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-6 mt-8">
              <p className="text-sm text-gray-600 text-center">Thank you for choosing MediCore Hospital</p>
              <p className="text-xs text-gray-500 text-center mt-2">For inquiries, contact us at info@medicore.co.ke</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content,
          #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
