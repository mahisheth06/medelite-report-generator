import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx'
import { saveAs } from 'file-saver'

export const generateDOCX = async (facilityData, manualInputs) => {
  const displayName = manualInputs.customName?.trim() || facilityData.legal_name

  const createRow = (label, value) => {
    const safeValue = value !== null && value !== undefined && value !== ''
      ? String(value)
      : '-'

    return new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: label,
                  bold: true,
                  size: 20,
                  font: 'Calibri',
                }),
              ],
              spacing: { before: 60, after: 60 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: safeValue,
                  italics: true,
                  size: 20,
                  font: 'Calibri',
                }),
              ],
              spacing: { before: 60, after: 60 },
            }),
          ],
        }),
      ],
    })
  }

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'INFINITE \u2014 Managed by MEDELITE',
                bold: true,
                size: 32,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'FACILITY ASSESSMENT SNAPSHOT',
                bold: true,
                size: 26,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: facilityData.state || '',
                size: 24,
                font: 'Calibri',
                color: '666666',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createRow('Name of Facility', displayName),
              createRow('Location', facilityData.full_address),
              createRow('EMR', manualInputs.emr),
              createRow('Census Capacity', facilityData.certified_beds),
              createRow('Current Census', manualInputs.currentCensus),
              createRow('Type of Patient', manualInputs.patientType),
              createRow('Previous Coverage from Medelite', manualInputs.previousCoverage),
              createRow('Previous Provider Performance from Medelite', manualInputs.previousPerformance),
              createRow('Medical Coverage', manualInputs.medicalCoverage),
              createRow('Overall Star Rating', facilityData.overall_rating),
              createRow('Health Inspection', facilityData.health_inspection_rating),
              createRow('Staffing', facilityData.staffing_rating),
              createRow('Quality of Resident Care', facilityData.quality_rating),
            ],
          }),

          new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Medicare Care Compare: ' + facilityData.medicare_url,
                size: 18,
                font: 'Calibri',
                color: '0066CC',
              }),
            ],
            spacing: { before: 200 },
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const safeName = displayName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  saveAs(blob, 'facility_assessment_' + safeName + '.docx')
}
