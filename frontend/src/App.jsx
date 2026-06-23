import { useState } from 'react'
import { fetchFacilityByCCN } from './services/api'
import { generatePDF } from './utils/pdfGenerator'
import { generateDOCX } from './utils/docxGenerator'

const StarRating = ({ rating }) => {
  if (!rating) return <span className="text-gray-400">N/A</span>
  return <span className="text-gray-900">{rating}/5 stars</span>
}

const StarCard = ({ label, rating }) => {
  const filled = rating || 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center gap-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">{label}</p>
      <p className="text-3xl font-black text-gray-900">{rating || 'N/A'}</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`text-xl ${i <= filled ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
        ))}
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
        <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${(filled / 5) * 100}%` }} />
      </div>
    </div>
  )
}

const DataRow = ({ label, value, children }) => (
  <div className="flex items-start py-2.5 border-b border-gray-100 last:border-0">
    <span className="font-semibold text-gray-700 text-sm w-56 shrink-0">{label}</span>
    <span className="text-gray-900 text-sm flex-1">
      {children || value || <span className="text-gray-400">N/A</span>}
    </span>
  </div>
)

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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b-2 border-gray-200 py-5 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Healthcare Analytics Platform</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">INFINITE</h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">Managed by MEDELITE</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <h2 className="text-base font-bold tracking-widest text-gray-700 uppercase">Facility Assessment Snapshot</h2>
            {facilityData && (
              <span className="inline-block mt-1 px-3 py-0.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
                {facilityData.state}
              </span>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Facility Lookup</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={ccn}
              onChange={(e) => setCcn(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter CMS Certification Number (CCN)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-7 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-4">Fetching facility data from CMS database...</p>
          </div>
        )}

        {facilityData && !isLoading && (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">CMS Data</h3>
                <span className="text-xs text-gray-400">CCN: {facilityData.ccn}</span>
              </div>
              <div className="px-6 py-2">
                <DataRow label="Legal Name" value={facilityData.legal_name} />
                <DataRow label="Location" value={facilityData.full_address} />
                <DataRow label="Census Capacity" value={facilityData.certified_beds} />
                <DataRow label="Overall Star Rating">
                  <StarRating rating={facilityData.overall_rating} />
                </DataRow>
                <DataRow label="Health Inspection">
                  <StarRating rating={facilityData.health_inspection_rating} />
                </DataRow>
                <DataRow label="Staffing">
                  <StarRating rating={facilityData.staffing_rating} />
                </DataRow>
                <DataRow label="Quality of Resident Care">
                  <StarRating rating={facilityData.quality_rating} />
                </DataRow>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <a href={facilityData.medicare_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                  View on Medicare Care Compare
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
              <StarCard label="Overall Rating" rating={facilityData.overall_rating} />
              <StarCard label="Health Inspection" rating={facilityData.health_inspection_rating} />
              <StarCard label="Staffing" rating={facilityData.staffing_rating} />
              <StarCard label="Quality of Care" rating={facilityData.quality_rating} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manual Inputs</h3>
                <p className="text-xs text-gray-400 mt-0.5">Internal operational data not available in CMS</p>
              </div>
              <div className="px-6 py-5 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Name of Facility
                    <span className="ml-2 text-xs font-normal text-gray-400">Optional - overrides CMS name in PDF</span>
                  </label>
                  <input type="text" value={manualInputs.customName} onChange={(e) => handleManualInput('customName', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">EMR</label>
                    <input type="text" value={manualInputs.emr} onChange={(e) => handleManualInput('emr', e.target.value)} placeholder="e.g. PCC, MatrixCare" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Census</label>
                    <input type="number" value={manualInputs.currentCensus} onChange={(e) => handleManualInput('currentCensus', e.target.value)} placeholder="e.g. 112" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type of Patient</label>
                  <input type="text" value={manualInputs.patientType} onChange={(e) => handleManualInput('patientType', e.target.value)} placeholder="e.g. Long-term and Short-term" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Previous Coverage from Medelite</label>
                  <select value={manualInputs.previousCoverage} onChange={(e) => handleManualInput('previousCoverage', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Previous Provider Performance from Medelite</label>
                  <input type="text" value={manualInputs.previousPerformance} onChange={(e) => handleManualInput('previousPerformance', e.target.value)} placeholder="e.g. About 30 patients/day" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Medical Coverage</label>
                  <input type="text" value={manualInputs.medicalCoverage} onChange={(e) => handleManualInput('medicalCoverage', e.target.value)} placeholder="e.g. Optometry, PCP, Podiatry" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pb-8">
              <p className="text-xs text-gray-400">Fill in manual fields above before downloading</p>
              <div className="flex gap-3">
                <button onClick={() => generateDOCX(facilityData, manualInputs)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm">
                  Download Word Doc
                </button>
                <button onClick={() => generatePDF(facilityData, manualInputs)} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
