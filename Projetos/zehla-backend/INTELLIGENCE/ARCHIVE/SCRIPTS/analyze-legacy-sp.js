const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('/Users/marciocau/Downloads/POUSADAS_MARKETING_FASE (1).xlsx');
    
    
    const targetSheet = 'POUSADAS_LITORAL_N_SP (1)';
    if (workbook.SheetNames.includes(targetSheet)) {
        const sheet = workbook.Sheets[targetSheet];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        
        if (data.length > 0) {
            );
            
        }
    } else {
        
    }
} catch (err) {
    console.error('Erro ao ler planilha:', err.message);
}
