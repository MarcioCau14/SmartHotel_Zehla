const XLSX = require('xlsx');
const path = require('path');
const os = require('os');
const fs = require('fs');

const downloadsPath = path.join(os.homedir(), 'Downloads');
const filePath = path.join(downloadsPath, 'POUSADAS_MARKETING_FASE.xlsx');
const jsonPath = path.join(__dirname, 'leads_saquarema.json');

try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let wb;
    if (fs.existsSync(filePath)) {
        wb = XLSX.readFile(filePath);
    } else {
        wb = XLSX.utils.book_new();
    }

    const ws = XLSX.utils.json_to_sheet(data);

    // Atualizar aba Saquarema
    if (wb.SheetNames.includes('POUSADAS_SAQUAREMA')) {
        const idx = wb.SheetNames.indexOf('POUSADAS_SAQUAREMA');
        wb.SheetNames.splice(idx, 1);
        delete wb.Sheets['POUSADAS_SAQUAREMA'];
    }

    XLSX.utils.book_append_sheet(wb, ws, "POUSADAS_SAQUAREMA");
    XLSX.writeFile(wb, filePath);

    
} catch (err) {
    console.error('Error processing JSON to Excel:', err);
    process.exit(1);
}
