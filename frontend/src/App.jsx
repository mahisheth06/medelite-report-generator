import { useState, useEffect, useRef } from 'react'
import { fetchFacilityByCCN } from './services/api'
import { generatePDF } from './utils/pdfGenerator'
import { generateDOCX } from './utils/docxGenerator'

const BRAND = {
  blue: '#2C5F8A',
  lightBlue: '#4A90C4',
  green: '#7BC67E',
  purple: '#9B3DC8',
  magenta: '#C724B1',
  accent: '#C8D952',
}

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value) return
    let start = 0
    const end = parseInt(value)
    const duration = 800
    const stepTime = Math.abs(Math.floor(duration / end))
    const timer = setInterval(() => {
      start += 1
      setDisplay(start)
      if (start === end) clearInterval(timer)
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}</span>
}

const StarCard = ({ label, rating, delay }) => {
  const filled = rating || 0
  const percentage = (filled / 5) * 100

  const getColor = (rating) => {
    if (rating >= 4) return '#7BC67E'
    if (rating >= 3) return '#4A90C4'
    if (rating >= 2) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-md p-5 flex flex-col items-center gap-3 card-hover animate-fade-in-up-delay-${delay}`}
    >
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center leading-tight">{label}</p>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-inner"
        style={{ background: `conic-gradient(${getColor(filled)} ${percentage}%, #f3f4f6 0%)` }}
      >
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
          <span style={{ color: getColor(filled) }} className="text-xl font-black">
            {rating || 'N/A'}
          </span>
        </div>
      </div>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ color: i <= filled ? getColor(filled) : '#E5E7EB' }} className="text-lg">
            ★
          </span>
        ))}
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%`, backgroundColor: getColor(filled) }}
        />
      </div>
      <p className="text-xs text-gray-400">{filled} out of 5</p>
    </div>
  )
}

const DataRow = ({ label, value, children }) => (
  <div className="flex items-start py-3 border-b border-gray-50 last:border-0 group">
    <span className="font-semibold text-gray-600 text-sm w-56 shrink-0 group-hover:text-gray-900 transition-colors">{label}</span>
    <span className="text-gray-900 text-sm flex-1 font-medium">
      {children || value || <span className="text-gray-300">—</span>}
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
    if (!ccn.trim()) {
      setError('Please enter a CCN.')
      return
    }

    setError(null)
    setFacilityData(null)
    setIsLoading(true)

    try {
      const data = await fetchFacilityByCCN(ccn.trim())
      setFacilityData(data)
      setManualInputs((prev) => ({ ...prev, customName: data.legal_name }))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualInput = (field, value) => {
    setManualInputs((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <header className="brand-gradient py-8 shadow-xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8D952' }}>
            Healthcare Analytics Platform
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">INFINITE</h1>
          <p className="text-sm font-semibold text-blue-100 mt-1 tracking-wide">Managed by MEDELITE</p>
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <h2 className="text-base font-bold tracking-widest text-white uppercase opacity-90">
              Facility Assessment Snapshot
            </h2>
            {facilityData && (
              <span
                className="inline-block mt-2 px-4 py-1 text-sm font-black rounded-full shadow-md"
                style={{ backgroundColor: '#C8D952', color: '#2C5F8A' }}
              >
                {facilityData.state}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md animate-fade-in-up">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.lightBlue }}>
            Facility Lookup
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={ccn}
              onChange={(e) => setCcn(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter CMS Certification Number (CCN)"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
              style={{ '--tw-ring-color': BRAND.lightBlue }}
              onFocus={(e) => (e.target.style.borderColor = BRAND.lightBlue)}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:opacity-90 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.lightBlue})` }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <span className="text-red-500 text-lg">⚠</span>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <div
              className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: BRAND.lightBlue, borderTopColor: 'transparent' }}
            />
            <p className="text-sm text-gray-400 mt-4 font-medium">Fetching facility data from CMS database...</p>
          </div>
        )}

        {facilityData && !isLoading && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden animate-fade-in-up">
              <div
                className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #F0F7FF, #F0FFF4)' }}
              >
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.blue }}>
                  CMS Data
                </h3>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: BRAND.lightBlue + '20', color: BRAND.blue }}
                >
                  CCN: {facilityData.ccn}
                </span>
              </div>

              <div className="px-6 py-2">
                <DataRow label="Legal Name" value={facilityData.legal_name} />
                <DataRow label="Location" value={facilityData.full_address} />
                <DataRow label="Census Capacity" value={facilityData.certified_beds} />
                <DataRow label="Overall Star Rating" value={`${facilityData.overall_rating}/5`} />
                <DataRow label="Health Inspection" value={`${facilityData.health_inspection_rating}/5`} />
                <DataRow label="Staffing" value={`${facilityData.staffing_rating}/5`} />
                <DataRow label="Quality of Resident Care" value={`${facilityData.quality_rating}/5`} />
              </div>

              <div
                className="px-6 py-3 border-t border-gray-50 flex items-center"
                style={{ background: 'linear-gradient(135deg, #F0F7FF, #F0FFF4)' }}
              >
                <a
                  href={facilityData.medicare_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold hover:underline transition-colors"
                  style={{ color: BRAND.lightBlue }}
                >
                  View on Medicare Care Compare
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StarCard label="Overall Rating" rating={facilityData.overall_rating} delay={1} />
              <StarCard label="Health Inspection" rating={facilityData.health_inspection_rating} delay={2} />
              <StarCard label="Staffing" rating={facilityData.staffing_rating} delay={3} />
              <StarCard label="Quality of Care" rating={facilityData.quality_rating} delay={4} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden animate-fade-in-up-delay-2">
              <div
                className="px-6 py-4 border-b border-gray-100"
                style={{ background: 'linear-gradient(135deg, #F0F7FF, #F0FFF4)' }}
              >
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.blue }}>
                  Manual Inputs
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Internal operational data not available in CMS</p>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Name of Facility
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      Optional - overrides CMS name in exports
                    </span>
                  </label>
                  <input
                    type="text"
                    value={manualInputs.customName}
                    onChange={(e) => handleManualInput('customName', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    onFocus={(e) => (e.target.style.borderColor = BRAND.lightBlue)}
                    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">EMR</label>
                    <input
                      type="text"
                      value={manualInputs.emr}
                      onChange={(e) => handleManualInput('emr', e.target.value)}
                      placeholder="e.g. PCC, MatrixCare"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                      onFocus={(e) => (e.target.style.borderColor = BRAND.lightBlue)}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Census</label>
                    <input
                      type="number"
                      value={manualInputs.currentCensus}
                      onChange={(e) => handleManualInput('currentCensus', e.target.value)}
                      placeholder="e.g. 112"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                      onFocus={(e) => (e.target.style.borderColor = BRAND.lightBlue)}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type of Patient</label>
                  <input
                    type="text"
                    value={manualInputs.patientType}
                    onChange={(e) => handleManualInput('patientType', e.target.value)}
                    placeholder="e.g. Long-term and Short-term"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    onFocus={(e) => (e.target.style.borderColor = BRAND.lightBlue)}
                    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Previous Coverage from Medelite
                  </label>
                  <select
                    value={manualInputs.previousCoverage}
                    onChange={(e) => handleManualInput('previousCoverage', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all bg-white"
                    onFocus={(e) => (e.target.style.borderColor = BRAND.lightBlue)}
                    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Previous Provider Performance from Medelite
                  </label>
                  <input
                    type="text"
                    value={manualInputs.previousPerformance}
                    onChange={(e) => handleManualInput('previousPerformance', e.target.value)}
                    placeholder="e.g. About 30 patients/day"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    onFocus={(e) => (e.target.style.borderColor = BRAND.lightBlue)}
                    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Medical Coverage</label>
                  <input
                    type="text"
                    value={manualInputs.medicalCoverage}
                    onChange={(e) => handleManualInput('medicalCoverage', e.target.value)}
                    placeholder="e.g. Optometry, PCP, Podiatry"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    onFocus={(e) => (e.target.style.borderColor = BRAND.lightBlue)}
                    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pb-8">
              <p className="text-xs text-gray-400">Fill in manual fields above before downloading</p>
              <div className="flex gap-3">
                <button
                  onClick={() => generateDOCX(facilityData, manualInputs)}
                  className="text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.magenta})` }}
                >
                  Download Word Doc
                </button>
                <button
                  onClick={() => generatePDF(facilityData, manualInputs)}
                  className="text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.green})` }}
                >
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