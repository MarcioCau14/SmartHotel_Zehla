const XLSX = require('xlsx');
const filePath = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_/LEADS_PRO.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const leads = XLSX.utils.sheet_to_json(worksheet);

console.log('--- KEYS ---');
console.log(Object.keys(leads[0]));
