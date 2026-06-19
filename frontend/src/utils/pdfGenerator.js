import { jsPDF } from 'jspdf'

const PAGE_WIDTH = 216
const PAGE_HEIGHT = 279
const MARGIN = 20
const COL1_WIDTH = 95
const COL2_X = MARGIN + COL1_WIDTH
const COL2_WIDTH = PAGE_WIDTH - MARGIN - COL1_WIDTH - MARGIN
const ROW_HEIGHT = 10
const LINE_HEIGHT = 5

export const generatePDF = (facilityData, manualInputs) => {
  const doc = new jsPDF('portrait', 'mm', 'letter')
  const displayName = manualInputs.customName?.trim() || facilityData.legal_name

  let y = MARGIN

  // --- HEADER ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(20, 20, 20)
  doc.text('INFINITE \u2014 Managed by MEDELITE', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 9

  doc.setFontSize(13)
  doc.text('FACILITY ASSESSMENT SNAPSHOT', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(facilityData.state || '', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 9

  // --- TABLE ---
  const drawRow = (label, value) => {
    const safeValue = value !== null && value !== undefined && value !== '' ? String(value) : '\u2014'
    const labelLines = doc.splitTextToSize(label, COL1_WIDTH - 6)
    const valueLines = doc.splitTextToSize(safeValue, COL2_WIDTH - 6)
    const numLines = Math.max(labelLines.length, valueLines.length)
    const rowH = Math.max(ROW_HEIGHT, numLines * LINE_HEIGHT + 5)

    // Row background (subtle alternating would go here — keeping white for clean look)
    // Label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)
    doc.text(labelLines, MARGIN + 3, y + 6.5)

    // Value
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(valueLines, COL2_X + 3, y + 6.5)

    // Row bottom border
    doc.setDrawColor(210, 210, 210)
    doc.setLineWidth(0.2)
    doc.line(MARGIN, y + rowH, PAGE_WIDTH - MARGIN, y + rowH)

    y += rowH
  }

  const tableTopY = y

  // Top border
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, tableTopY, PAGE_WIDTH - MARGIN, tableTopY)

  // All rows
  drawRow('Name of Facility', displayName)
  drawRow('Location', facilityData.full_address)
  drawRow('EMR', manualInputs.emr)
  drawRow('Census Capacity', String(facilityData.certified_beds))
  drawRow('Current Census', manualInputs.currentCensus)
  drawRow('Type of Patient', manualInputs.patientType)
  drawRow('Previous Coverage from Medelite', manualInputs.previousCoverage)
  drawRow('Previous Provider Performance from Medelite', manualInputs.previousPerformance)
  drawRow('Medical Coverage', manualInputs.medicalCoverage)
  drawRow('Overall Star Rating', String(facilityData.overall_rating))
  drawRow('Health Inspection', String(facilityData.health_inspection_rating))
  drawRow('Staffing', String(facilityData.staffing_rating))
  drawRow('Quality of Resident Care', String(facilityData.quality_rating))

  const tableBottomY = y

// Outer border
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.5)
  doc.rect(MARGIN, tableTopY, PAGE_WIDTH - MARGIN * 2, tableBottomY - tableTopY)

  // Column divider — draw explicitly with high contrast
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.5)
  doc.line(COL2_X, tableTopY, COL2_X, tableBottomY)

  y += 8

  // --- MEDICARE LINK ---
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(0, 102, 204)
  const linkText = 'View on Medicare Care Compare: ' + facilityData.medicare_url
  doc.textWithLink(linkText, MARGIN, y, { url: facilityData.medicare_url })

  // --- SAVE ---
  const safeName = displayName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  doc.save('facility_assessment_' + safeName + '.pdf')
}
