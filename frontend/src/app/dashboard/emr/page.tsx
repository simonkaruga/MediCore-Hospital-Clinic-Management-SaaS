'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function EMRPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [drugSearch, setDrugSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Visit
    visitType: 'OUTPATIENT',
    chiefComplaint: '',
    
    // Vitals
    bloodPressure: '',
    temperature: '',
    weight: '',
    height: '',
    pulse: '',
    oxygenSaturation: '',
    
    // SOAP Notes
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    
    // Diagnosis
    diagnosis: '',
    icd10Code: '',
    
    // Prescription
    prescriptionItems: [{ drugName: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }],
    
    // Lab
    labTests: [],
  });

  useEffect(() => {
    if (step === 4) {
      fetchInventory();
    }
  }, [step]);

  useEffect(() => {
    if (patientSearch.length > 2) {
      searchPatients();
    } else {
      setPatientResults([]);
    }
  }, [patientSearch]);

  const searchPatients = async () => {
    try {
      const res = await apiClient.get(`/patients?q=${patientSearch}`);
      setPatientResults(res.data.data || []);
    } catch (error) {
      console.error('Failed to search patients:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create visit
      const visitResponse = await apiClient.post('/emr/visits', {
        patientId: selectedPatient.id,
        visitType: formData.visitType,
        chiefComplaint: formData.chiefComplaint,
      });

      const visitId = visitResponse.data.id;

      // Add vitals
      await apiClient.post('/emr/vitals', {
        visitId,
        bloodPressure: formData.bloodPressure,
        temperature: parseFloat(formData.temperature) || null,
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        pulse: parseInt(formData.pulse) || null,
        oxygenSaturation: parseFloat(formData.oxygenSaturation) || null,
      });

      // Add clinical notes
      await apiClient.post('/emr/clinical-notes', {
        visitId,
        subjective: formData.subjective,
        objective: formData.objective,
        assessment: formData.assessment,
        plan: formData.plan,
      });

      // Add diagnosis
      if (formData.diagnosis) {
        await apiClient.post('/emr/diagnoses', {
          visitId,
          diagnosis: formData.diagnosis,
          icd10Code: formData.icd10Code,
          isPrimary: true,
        });
      }

      // Add prescription
      if (formData.prescriptionItems[0].drugName) {
        await apiClient.post('/pharmacy/prescriptions', {
          visitId,
          items: formData.prescriptionItems.filter(item => item.drugName),
        });
      }

      alert('Patient record saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save record:', error);
      alert('Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const addPrescriptionItem = () => {
    setFormData({
      ...formData,
      prescriptionItems: [...formData.prescriptionItems, { drugName: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Consultation</h1>
        <p className="text-gray-600 mt-1">Record patient visit and medical notes</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {s}
              </div>
              {s < 4 && <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Patient & Vitals</span>
          <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Clinical Notes</span>
          <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Diagnosis</span>
          <span className={step >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Prescription</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Patient & Vitals */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Patient Information & Vitals</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Patient</label>
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search by name or patient number..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!selectedPatient}
              />
              {patientResults.length > 0 && (
                <div className="mt-2 bg-white border border-gray-300 rounded-xl max-h-48 overflow-y-auto">
                  {patientResults.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setPatientSearch(`${patient.firstName} ${patient.lastName} (${patient.patientNumber})`);
                        setPatientResults([]);
                      }}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                      <div className="text-sm text-gray-600">{patient.patientNumber} • {patient.phone}</div>
                    </div>
                  ))}
                </div>
              )}
              {selectedPatient && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-green-900">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      <p className="text-sm text-green-700">Patient #: {selectedPatient.patientNumber}</p>
                      <p className="text-sm text-green-700">Phone: {selectedPatient.phone}</p>
                      {selectedPatient.allergies && (
                        <p className="text-sm text-red-600 font-medium mt-1">⚠️ Allergies: {selectedPatient.allergies}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(null);
                        setPatientSearch('');
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Visit Type</label>
                <select
                  value={formData.visitType}
                  onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OUTPATIENT">Outpatient</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="INPATIENT">Inpatient</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chief Complaint</label>
                <input
                  type="text"
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  placeholder="e.g., Fever and headache"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6">Vital Signs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BP (mmHg)</label>
                <input
                  type="text"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  placeholder="120/80"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="36.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pulse (bpm)</label>
                <input
                  type="number"
                  value={formData.pulse}
                  onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                  placeholder="72"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="170"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">O2 Sat (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.oxygenSaturation}
                  onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                  placeholder="98"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Clinical Notes (SOAP) */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Clinical Notes (SOAP)</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subjective</label>
              <textarea
                value={formData.subjective}
                onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                placeholder="Patient's description of symptoms..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Objective</label>
              <textarea
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                placeholder="Physical examination findings..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment</label>
              <textarea
                value={formData.assessment}
                onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                placeholder="Clinical assessment and interpretation..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Plan</label>
              <textarea
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                placeholder="Treatment plan and follow-up..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 3: Diagnosis */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Diagnosis</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Diagnosis</label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="e.g., Upper Respiratory Tract Infection"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ICD-10 Code (Optional)</label>
              <input
                type="text"
                value={formData.icd10Code}
                onChange={(e) => setFormData({ ...formData, icd10Code: e.target.value })}
                placeholder="e.g., J06.9"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 4: Prescription */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Prescription</h2>
              <button
                type="button"
                onClick={addPrescriptionItem}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
              >
                + Add Drug
              </button>
            </div>

            {/* Available Medicines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Available Medicines in Stock</h3>
              <input
                type="text"
                value={drugSearch}
                onChange={(e) => setDrugSearch(e.target.value)}
                placeholder="Search medicines..."
                className="w-full px-3 py-2 border border-blue-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {inventory
                  .filter(item => 
                    item.name.toLowerCase().includes(drugSearch.toLowerCase()) ||
                    item.genericName?.toLowerCase().includes(drugSearch.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        const items = [...formData.prescriptionItems];
                        const lastIndex = items.length - 1;
                        if (!items[lastIndex].drugName) {
                          items[lastIndex].drugName = item.name;
                          setFormData({ ...formData, prescriptionItems: items });
                        }
                      }}
                      className="flex justify-between items-center p-2 bg-white rounded hover:bg-blue-100 cursor-pointer"
                    >
                      <div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                        {item.genericName && <span className="text-sm text-gray-600 ml-2">({item.genericName})</span>}
                      </div>
                      <span className={`text-sm font-semibold ${item.quantity > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {formData.prescriptionItems.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Drug Name</label>
                    <input
                      type="text"
                      value={item.drugName}
                      onChange={(e) => {
                        const items = [...formData.prescriptionItems];
                        items[index].drugName = e.target.value;
                        setFormData({ ...formData, prescriptionItems: items });
                      }}
                      placeholder="e.g., Amoxicillin"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                    <input
                      type="text"
                      value={item.dosage}
                      onChange={(e) => {
                        const items = [...formData.prescriptionItems];
                        items[index].dosage = e.target.value;
                        setFormData({ ...formData, prescriptionItems: items });
                      }}
                      placeholder="e.g., 500mg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) => {
                        const items = [...formData.prescriptionItems];
                        items[index].frequency = e.target.value;
                        setFormData({ ...formData, prescriptionItems: items });
                      }}
                      placeholder="e.g., 3 times daily"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => {
                        const items = [...formData.prescriptionItems];
                        items[index].duration = e.target.value;
                        setFormData({ ...formData, prescriptionItems: items });
                      }}
                      placeholder="e.g., 7 days"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                  <input
                    type="text"
                    value={item.instructions}
                    onChange={(e) => {
                      const items = [...formData.prescriptionItems];
                      items[index].instructions = e.target.value;
                      setFormData({ ...formData, prescriptionItems: items });
                    }}
                    placeholder="e.g., Take after meals"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold"
            >
              Previous
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Consultation'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
