const XLSX = require('xlsx');
const path = require('path');
const os = require('os');
const fs = require('fs');

const downloadsPath = path.join(os.homedir(), 'Downloads');
const filePath = path.join(downloadsPath, 'POUSADAS_LAGOS_RJ.xlsx');

const regions = [
    { name: 'POUSADAS_BUZIOS', file: 'leads_buzios.json' },
    { name: 'POUSADAS_CABO_FRIO', file: 'leads_cabo_frio.json' },
    { name: 'POUSADAS_ARRAIAL', file: 'leads_arraial.json' },
    { name: 'POUSADAS_RIO_OSTRAS', file: 'leads_rio_ostras.json' },
    { name: 'POUSADAS_MACAE', file: 'leads_macae.json' },
    { name: 'POUSADAS_LAGUNA', file: 'leads_laguna.json' },
    { name: 'POUSADAS_SAQUAREMA', file: 'leads_saquarema.json' }
];

try {
    let wb;
    if (fs.existsSync(filePath)) {
        wb = XLSX.readFile(filePath);
    } else {
        wb = XLSX.utils.book_new();
    }

    regions.forEach(region => {
        const jsonPath = path.join(__dirname, region.file);
        if (fs.existsSync(jsonPath)) {
            const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const ws = XLSX.utils.json_to_sheet(data);

            // Remover aba antiga se existir para evitar duplicidade
            if (wb.SheetNames.includes(region.name)) {
                const idx = wb.SheetNames.indexOf(region.name);
                wb.SheetNames.splice(idx, 1);
                delete wb.Sheets[region.name];
            }

            XLSX.utils.book_append_sheet(wb, ws, region.name);
            console.log(`Region ${region.name} loaded successfully.`);
        } else {
            console.warn(`Warning: ${region.file} not found. Skipping...`);
        }
    });

    XLSX.writeFile(wb, filePath);
    console.log(`\nSuccess: POUSADAS_LAGOS_RJ.xlsx updated with ${regions.length} regions.`);
    console.log(`Path: ${filePath}`);

} catch (err) {
    console.error('Error consolidating Lagos RJ Excel:', err);
    process.exit(1);
}
