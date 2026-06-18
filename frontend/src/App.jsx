import { useState } from 'react'
import { fetchFacilityByCCN } from './services/api'
import { generatePDF } from './utils/pdfGenerator'

function App() {
  const [ccn, setCcn] = useState('')
  const [facilityData, setFacilityData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [manualInputs, setManualInputs] = useState({
    customName: '',
    emr: '',
    currentCensus: '',
    patientType: '',
    previousCoverage: '',
    previousPerformance: '',
    medicalCoverage: '',
  })

  const handleSearch = async () => {
    if (!ccn.trim()) { setError('Please enter a CCN.'); return }
    setError(null); setFacilityData(null); setIsLoading(true)
    try {
      const data = await fetchFacilityByCCN(ccn.trim())
      setFacilityData(data)
      setManualInputs(prev => ({ ...prev, customName: data.legal_name }))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualInput = (field, value) => {
    setManualInputs(prev => ({ ...prev, [field]: value }))
  }

  const handleDownloadPDF = () => {
    generatePDF(facilityData, manualInputs)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-2xl font-bold tracking-wide text-gray-900">INFINITE - Managed by MEDELITE</h1>
          <h2 className="text-lg font-semibold text-gray-700 mt-1">FACILITY ASSESSMENT SNAPSHOT</h2>
          {facilityData && <p className="text-base font-medium text-gray-500 mt-1">{facilityData.state}</p>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Facility Lookup</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={ccn}
              onChange={(e) => setCcn(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter CCN (e.g. 686123)"
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Fetching facility data from CMS...</p>
          </div>
        )}

        {facilityData && !isLoading && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">CMS Data</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Legal Name</span>
                  <span className="text-gray-900">{facilityData.legal_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Location</span>
                  <span className="text-gray-900">{facilityData.full_address}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Census Capacity</span>
                  <span className="text-gray-900">{facilityData.certified_beds}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Overall Star Rating</span>
                  <span className="text-gray-900">{facilityData.overall_rating}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Health Inspection</span>
                  <span className="text-gray-900">{facilityData.health_inspection_rating}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Staffing</span>
                  <span className="text-gray-900">{facilityData.staffing_rating}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Quality of Resident Care</span>
                  <span className="text-gray-900">{facilityData.quality_rating}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a href={facilityData.medicare_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  View on Medicare Care Compare
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Manual Inputs</h3>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name of Facility
                    <span className="ml-1 text-xs font-normal text-gray-400">(override CMS name)</span>
                  </label>
                  <input
                    type="text"
                    value={manualInputs.customName}
                    onChange={(e) => handleManualInput('customName', e.target.value)}
                    placeholder="Leave blank to use CMS legal name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EMR</label>
                  <input
                    type="text"
                    value={manualInputs.emr}
                    onChange={(e) => handleManualInput('emr', e.target.value)}
                    placeholder="e.g. PCC, MatrixCare"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Census</label>
                  <input
                    type="number"
                    value={manualInputs.currentCensus}
                    onChange={(e) => handleManualInput('currentCensus', e.target.value)}
                    placeholder="e.g. 112"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type of Patient</label>
                  <input
                    type="text"
                    value={manualInputs.patientType}
                    onChange={(e) => handleManualInput('patientType', e.target.value)}
                    placeholder="e.g. Long-term and Short-term"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previous Coverage from Medelite</label>
                  <select
                    value={manualInputs.previousCoverage}
                    onChange={(e) => handleManualInput('previousCoverage', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previous Provider Performance from Medelite</label>
                  <input
                    type="text"
                    value={manualInputs.previousPerformance}
                    onChange={(e) => handleManualInput('previousPerformance', e.target.value)}
                    placeholder="e.g. About 30 patients/day"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Coverage</label>
                  <input
                    type="text"
                    value={manualInputs.medicalCoverage}
                    onChange={(e) => handleManualInput('medicalCoverage', e.target.value)}
                    placeholder="e.g. Optometry, PCP, Podiatry"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>
            </div>

            <div className="flex justify-end pb-8">
              <button
                onClick={handleDownloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md text-sm font-semibold transition-colors shadow-sm"
              >
                Download PDF
              </button>
            </div>
          </>
        )}

      </main>
    </div>
  )
}

export default App
