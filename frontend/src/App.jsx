import { useState } from 'react'
import { fetchFacilityByCCN } from './services/api'

function App() {
  const [ccn, setCcn] = useState('')
  const [facilityData, setFacilityData] = useState(null)
  const [manualInputs, setManualInputs] = useState({
    customName: '',
    emr: '',
    currentCensus: '',
    patientType: '',
    previousCoverage: '',
    previousPerformance: '',
    medicalCoverage: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!ccn.trim()) {
      setError('Please enter a CCN before searching.')
      return
    }
    setError(null)
    setFacilityData(null)
    setIsLoading(true)
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-2xl font-bold tracking-wide text-gray-900">
            INFINITE — Managed by MEDELITE
          </h1>
          <h2 className="text-lg font-semibold text-gray-700 mt-1">
            FACILITY ASSESSMENT SNAPSHOT
          </h2>
          {facilityData && (
            <p className="text-base font-medium text-gray-500 mt-1">
              {facilityData.state}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Facility Lookup
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={ccn}
              onChange={(e) => setCcn(e.target.value)}
              onKeyDown={handleKeyDown}
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Facility Data
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700">Legal Name (from CMS)</span>
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
              
               <a href={facilityData.medicare_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View on Medicare Care Compare
              </a>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App