import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { join } from 'path';


const folder = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_';
const files = fs.readdirSync(folder).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
  const workbook = XLSX.readFile(join(folder, file));
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  
  
  
});
