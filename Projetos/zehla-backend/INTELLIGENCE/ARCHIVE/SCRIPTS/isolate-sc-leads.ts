import * as XLSX from 'xlsx';
import { join } from 'path';
import * as fs from 'fs';

const folder = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_';
const sourceFile = join(folder, 'POUSADAS_MARKETING_FASE (1).xlsx');
const targetFile = join(folder, 'PLANILHA_LITORAL_SC.xlsx');
const sheetName = 'Leads_SUL_BR (1)';

async function isolateScLeads() {
  console.log(`📂 Isolando aba [${sheetName}] para novo arquivo...`);
  
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Arquivo fonte não encontrado: ${sourceFile}`);
    return;
  }

  const workbook = XLSX.readFile(sourceFile);
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    console.error(`❌ Aba [${sheetName}] não encontrada no arquivo.`);
    return;
  }

  // Criar novo workbook apenas com essa aba
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, sheet, 'Litoral SC');

  // Salvar como PLANILHA_LITORAL_SC.xlsx
  XLSX.writeFile(newWorkbook, targetFile);

  console.log(`✨ [SUCESSO] Planilha isolada e renomeada: ${targetFile}`);
  
  // Opcional: Verificar contagem
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log(`📊 Total de leads em SC isolados: ${data.length}`);
}

isolateScLeads().catch(console.error);
