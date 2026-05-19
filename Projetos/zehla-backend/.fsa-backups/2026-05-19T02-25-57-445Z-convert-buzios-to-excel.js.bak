const XLSX = require('xlsx');
const path = require('path');
const os = require('os');
const fs = require('fs');

const downloadsPath = path.join(os.homedir(), 'Downloads');
const filePath = path.join(downloadsPath, 'POUSADAS_LAGOS_RJ.xlsx');
const jsonPath = path.join(__dirname, 'leads_buzios.json');

try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let wb;
    if (fs.existsSync(filePath)) {
        wb = XLSX.readFile(filePath);
    } else {
        wb = XLSX.utils.book_new();
    }

    const ws = XLSX.utils.json_to_sheet(data);

    // Atualizar aba Búzios
    if (wb.SheetNames.includes('POUSADAS_BUZIOS')) {
        const idx = wb.SheetNames.indexOf('POUSADAS_BUZIOS');
        wb.SheetNames.splice(idx, 1);
        delete wb.Sheets['POUSADAS_BUZIOS'];
    }

    XLSX.utils.book_append_sheet(wb, ws, "POUSADAS_BUZIOS");
    XLSX.writeFile(wb, filePath);

    console.log(`Success: POUSADAS_LAGOS_RJ.xlsx (BÚZIOS) updated via JSON.`);
} catch (err) {
    console.error('Error processing Búzios JSON to Excel:', err);
    process.exit(1);
}
