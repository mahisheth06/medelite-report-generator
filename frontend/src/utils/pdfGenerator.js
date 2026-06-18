// utils/pdfGenerator.js
// Generates the Facility Assessment Snapshot PDF using jsPDF.


import { jsPDF } from 'jspdf'

// --- Page Layout Constants ---
const PAGE_WIDTH = 216    // US Letter width in mm
const PAGE_HEIGHT = 279   // US Letter height in mm
const MARGIN = 20         // Left and right margin in mm
const COL1_WIDTH = 90     // Width of the label column
const COL2_X = MARGIN + COL1_WIDTH  // Where the value column starts
const COL2_WIDTH = PAGE_WIDTH - MARGIN - COL1_WIDTH - MARGIN  // Value column width
const ROW_HEIGHT = 10     // Height of each table row in mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2  // Total usable width


export const generatePDF = (facilityData, manualInputs) => {
  const doc = new jsPDF('portrait', 'mm', 'letter')

  // --- Determine the display name ---
  const displayName = manualInputs.customName?.trim() || facilityData.legal_name

  // --- Starting Y position tracker ---
  let y = MARGIN

  // =========================================================
  // SECTION 1: BRANDING HEADER
  // =========================================================

  // "INFINITE — Managed by MEDELITE" — centered, bold, large
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('INFINITE \u2014 Managed by MEDELITE', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 8

  // "FACILITY ASSESSMENT SNAPSHOT" — centered, bold, medium
  doc.setFontSize(13)
  doc.text('FACILITY ASSESSMENT SNAPSHOT', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 7

  // State abbreviation — centered, normal weight
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(facilityData.state || '', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 8

  // =========================================================
  // SECTION 2: DATA TABLE
  // =========================================================
 

  // Helper function: draws one table row with a bottom border
  const drawRow = (label, value) => {
    const safeValue = value !== null && value !== undefined ? String(value) : '—'

    // Draw the bottom border line of this row
    doc.setDrawColor(200, 200, 200)  // Light gray
    doc.setLineWidth(0.2)
    doc.line(MARGIN, y + ROW_HEIGHT, PAGE_WIDTH - MARGIN, y + ROW_HEIGHT)

    // Label — bold, left column
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)
    doc.text(label, MARGIN + 2, y + 6.5)

    // Value — italic, right column
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(safeValue, COL2_X + 2, y + 6.5)

    y += ROW_HEIGHT
  }

  // Draw the outer table border (top line)
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)

  // Draw vertical divider between columns (full table height)
  const tableTopY = y

  // --- Draw all rows ---
  drawRow('Name of Facility', displayName)
  drawRow('Location', facilityData.full_address)
  drawRow('EMR', manualInputs.emr)
  drawRow('Census Capacity', facilityData.certified_beds)
  drawRow('Current Census', manualInputs.currentCensus)
  drawRow('Type of Patient', manualInputs.patientType)
  drawRow('Previous Coverage from Medelite', manualInputs.previousCoverage)
  drawRow('Previous Provider Performance from Medelite', manualInputs.previousPerformance)
  drawRow('Medical Coverage', manualInputs.medicalCoverage)
  drawRow('Overall Star Rating', facilityData.overall_rating)
  drawRow('Health Inspection', facilityData.health_inspection_rating)
  drawRow('Staffing', facilityData.staffing_rating)
  drawRow('Quality of Resident Care', facilityData.quality_rating)

  const tableBottomY = y

  // Draw outer border (left, right, bottom lines)
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, tableTopY, MARGIN, tableBottomY)              // Left border
  doc.line(PAGE_WIDTH - MARGIN, tableTopY, PAGE_WIDTH - MARGIN, tableBottomY)  // Right border
  doc.line(MARGIN, tableBottomY, PAGE_WIDTH - MARGIN, tableBottomY)  // Bottom border

  // Draw vertical column divider
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.line(COL2_X, tableTopY, COL2_X, tableBottomY)

  y += 10

  // =========================================================
  // SECTION 3: MEDICARE HYPERLINK
  // =========================================================

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 255)   // Blue color for the link

  const linkText = `Medicare Care Compare: ${facilityData.medicare_url}`
  doc.textWithLink(linkText, MARGIN, y, { url: facilityData.medicare_url })

  // Reset text color to black for anything after
  doc.setTextColor(0, 0, 0)

  // =========================================================
  // TRIGGER DOWNLOAD
  // =========================================================
  
  const safeName = displayName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  doc.save(`facility_assessment_${safeName}.pdf`)
}