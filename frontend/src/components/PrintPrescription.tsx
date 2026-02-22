'use client';

export default function PrintPrescription({ prescription, patient, onClose }: any) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between print:hidden">
          <h2 className="text-2xl font-bold text-gray-900">Print Prescription</h2>
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

        <div className="p-8" id="prescription-content">
          <div className="border-4 border-blue-600 rounded-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600">MediCore Hospital</h1>
              <p className="text-gray-600 mt-2">Nairobi, Kenya | +254700000000 | info@medicore.co.ke</p>
            </div>

            <div className="border-t-2 border-b-2 border-gray-300 py-4 mb-6">
              <h2 className="text-2xl font-bold text-center text-gray-900">PRESCRIPTION</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-600">Patient Name</p>
                <p className="font-semibold text-gray-900">{patient?.firstName} {patient?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Patient Number</p>
                <p className="font-semibold text-gray-900">{patient?.patientNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{new Date(prescription.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="font-semibold text-gray-900">Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">℞</span> Medications
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 text-gray-700">Drug Name</th>
                    <th className="text-left py-2 text-gray-700">Dosage</th>
                    <th className="text-left py-2 text-gray-700">Frequency</th>
                    <th className="text-left py-2 text-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 font-semibold">{item.drugName}</td>
                      <td className="py-3">{item.dosage}</td>
                      <td className="py-3">{item.frequency}</td>
                      <td className="py-3">{item.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {prescription.instructions && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Instructions</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{prescription.instructions}</p>
              </div>
            )}

            <div className="mt-12 pt-6 border-t-2 border-gray-300">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Doctor's Signature</p>
                  <div className="border-b-2 border-gray-400 w-48"></div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">License No: {prescription.doctor?.licenseNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #prescription-content,
          #prescription-content * {
            visibility: visible;
          }
          #prescription-content {
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
