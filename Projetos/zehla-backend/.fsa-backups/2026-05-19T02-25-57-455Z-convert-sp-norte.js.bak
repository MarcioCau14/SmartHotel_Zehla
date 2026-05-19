const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const regions = [
    { name: 'SP_BATCH_01', file: 'leads_sp_01.json' },
    { name: 'SP_BATCH_02', file: 'leads_sp_02.json' },
    { name: 'SP_BATCH_03', file: 'leads_sp_03.json' },
    { name: 'SP_BATCH_04', file: 'leads_sp_04.json' },
    { name: 'SP_BATCH_05', file: 'leads_sp_05.json' },
    { name: 'SP_BATCH_06', file: 'leads_sp_06.json' },
    { name: 'SP_BATCH_07', file: 'leads_sp_07.json' },
    { name: 'SP_BATCH_08', file: 'leads_sp_08.json' },
    { name: 'SP_BATCH_09', file: 'leads_sp_09.json' },
    { name: 'SP_BATCH_10', file: 'leads_sp_10.json' },
    { name: 'SP_BATCH_11', file: 'leads_sp_11.json' }
];

try {
    let allLeads = [];
    
    regions.forEach(region => {
        const filePath = path.join(__dirname, region.file);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            allLeads = allLeads.concat(data);
            console.log(`Region ${region.name} loaded successfully.`);
        } else {
            console.warn(`Warning: File ${region.file} for ${region.name} not found.`);
        }
    });

    if (allLeads.length === 0) {
        console.error('Error: No leads found to convert.');
        process.exit(1);
    }

    const worksheet = XLSX.utils.json_to_sheet(allLeads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LEADS_SP_NORTE');

    const outputPath = '/Users/marciocau/Downloads/POUSADA_LITORAL_SP_NORTE.xlsx';
    XLSX.writeFile(workbook, outputPath);

    console.log(`\nSuccess: POUSADA_LITORAL_SP_NORTE.xlsx created with ${allLeads.length} leads.`);
    console.log(`Path: ${outputPath}`);

} catch (err) {
    console.error('Critical Error during conversion:', err.message);
}
