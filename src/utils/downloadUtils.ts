
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { CaseFile } from '@/types/files';

export type DownloadFormat = 'pdf' | 'docx' | 'excel' | 'csv' | 'zip';

export const downloadFile = async (file: CaseFile, format: DownloadFormat = 'pdf') => {
  try {
    switch (format) {
      case 'pdf':
        await downloadAsPDF(file);
        break;
      case 'excel':
        downloadAsExcel([file]);
        break;
      case 'csv':
        downloadAsCSV([file]);
        break;
      case 'zip':
        await downloadAsZip([file]);
        break;
      default:
        console.log(`Downloading ${file.name} in original format`);
        // Simulate original file download
        const blob = new Blob(['File content placeholder'], { type: 'application/octet-stream' });
        saveAs(blob, file.name);
    }
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download ${file.name}`);
  }
};

export const downloadMultipleFiles = async (files: CaseFile[], format: DownloadFormat) => {
  try {
    switch (format) {
      case 'excel':
        downloadAsExcel(files);
        break;
      case 'csv':
        downloadAsCSV(files);
        break;
      case 'zip':
        await downloadAsZip(files);
        break;
      default:
        // Download each file individually
        for (const file of files) {
          await downloadFile(file, format);
        }
    }
  } catch (error) {
    console.error('Bulk download failed:', error);
    throw new Error('Failed to download files');
  }
};

const downloadAsPDF = async (file: CaseFile) => {
  // Simulate PDF generation - in real app, this would convert the file to PDF
  const pdfContent = `
    File: ${file.name}
    Type: ${file.type}
    Case: ${file.caseNumber}
    Size: ${file.size}
    Uploaded: ${file.uploadDate}
    Uploaded by: ${file.uploadedBy}
  `;
  
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  saveAs(blob, `${file.name.split('.')[0]}.pdf`);
};

const downloadAsExcel = (files: CaseFile[]) => {
  const worksheet = XLSX.utils.json_to_sheet(files.map(file => ({
    'File Name': file.name,
    'Type': file.type,
    'Case Number': file.caseNumber,
    'Size': file.size,
    'Upload Date': file.uploadDate,
    'Uploaded By': file.uploadedBy
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Case Files');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = files.length === 1 ? `${files[0].name.split('.')[0]}.xlsx` : 'case-files-export.xlsx';
  saveAs(blob, fileName);
};

const downloadAsCSV = (files: CaseFile[]) => {
  const headers = ['File Name', 'Type', 'Case Number', 'Size', 'Upload Date', 'Uploaded By'];
  const csvContent = [
    headers.join(','),
    ...files.map(file => [
      `"${file.name}"`,
      `"${file.type}"`,
      `"${file.caseNumber}"`,
      `"${file.size}"`,
      `"${file.uploadDate}"`,
      `"${file.uploadedBy}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const fileName = files.length === 1 ? `${files[0].name.split('.')[0]}.csv` : 'case-files-export.csv';
  saveAs(blob, fileName);
};

const downloadAsZip = async (files: CaseFile[]) => {
  const zip = new JSZip();
  
  // Add each file to the ZIP
  files.forEach(file => {
    // Simulate file content - in real app, you'd fetch actual file content
    const fileContent = `File: ${file.name}\nType: ${file.type}\nCase: ${file.caseNumber}`;
    zip.file(file.name, fileContent);
  });

  // Add a manifest file
  const manifest = files.map(file => ({
    name: file.name,
    type: file.type,
    caseNumber: file.caseNumber,
    size: file.size,
    uploadDate: file.uploadDate,
    uploadedBy: file.uploadedBy
  }));
  
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const fileName = files.length === 1 ? `${files[0].caseNumber}-files.zip` : 'case-files-bundle.zip';
  saveAs(zipBlob, fileName);
};

export const getDownloadFormats = (): { value: DownloadFormat; label: string; description: string }[] => [
  { value: 'pdf', label: 'PDF', description: 'Convert to PDF format' },
  { value: 'excel', label: 'Excel', description: 'Export as Excel spreadsheet' },
  { value: 'csv', label: 'CSV', description: 'Export as CSV file' },
  { value: 'zip', label: 'ZIP Archive', description: 'Bundle files in ZIP archive' }
];
