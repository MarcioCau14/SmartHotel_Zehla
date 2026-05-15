const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const outputFilePath = path.join(process.env.HOME, 'Downloads', 'POUSADA_LITORAL_BAHIA.xlsx');

const regions = [
    { name: 'BAHIA_BATCH_01', file: 'leads_bahia_01.json' },
    { name: 'BAHIA_BATCH_02', file: 'leads_bahia_02.json' },
    { name: 'BAHIA_BATCH_03', file: 'leads_bahia_03.json' },
    { name: 'BAHIA_BATCH_04', file: 'leads_bahia_04.json' },
    { name: 'BAHIA_BATCH_05', file: 'leads_bahia_05.json' },
    { name: 'BAHIA_BATCH_06', file: 'leads_bahia_06.json' },
    { name: 'BAHIA_BATCH_07', file: 'leads_bahia_07.json' },
    { name: 'BAHIA_BATCH_08', file: 'leads_bahia_08.json' },
    { name: 'BAHIA_BATCH_09', file: 'leads_bahia_09.json' },
    { name: 'BAHIA_BATCH_10', file: 'leads_bahia_10.json' },
    { name: 'BAHIA_BATCH_11', file: 'leads_bahia_11.json' }
];

try {
    let allLeads = [];
    
    regions.forEach(region => {
        const filePath = path.join(__dirname, region.file);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const leadsWithRegion = data.map(lead => ({
                ...lead,
                "Região": region.name
            }));
            allLeads = allLeads.concat(leadsWithRegion);
            console.log(`Region ${region.name} loaded successfully.`);
        }
    });

    if (allLeads.length === 0) {
        console.error("No leads found to export.");
        process.exit(1);
    }

    const worksheet = xlsx.utils.json_to_sheet(allLeads);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'LEADS_BAHIA');

    xlsx.writeFile(workbook, outputFilePath);
    console.log(`\nSuccess: POUSADA_LITORAL_BAHIA.xlsx created with ${allLeads.length} leads.`);
    console.log(`Path: ${outputFilePath}`);

} catch (error) {
    console.error("Error during consolidation:", error.message);
    process.exit(1);
}
