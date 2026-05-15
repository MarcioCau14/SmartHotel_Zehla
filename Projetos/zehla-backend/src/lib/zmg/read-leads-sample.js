const XLSX = require('xlsx');
const path = require('path');

const filePath = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_/LEADS_PRO.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('--- HEADERS ---');
  console.log(data[0]);
  console.log('--- SAMPLE DATA ---');
  console.log(data.slice(1, 4));
} catch (error) {
  console.error('Error reading Excel:', error);
}
