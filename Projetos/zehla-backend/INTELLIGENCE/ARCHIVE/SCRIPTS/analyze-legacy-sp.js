const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('/Users/marciocau/Downloads/POUSADAS_MARKETING_FASE (1).xlsx');
    console.log('Abas encontradas:', workbook.SheetNames);
    
    const targetSheet = 'POUSADAS_LITORAL_N_SP (1)';
    if (workbook.SheetNames.includes(targetSheet)) {
        const sheet = workbook.Sheets[targetSheet];
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log(`\n--- Analise da Aba [${targetSheet}] ---`);
        console.log(`Total de linhas: ${data.length}`);
        if (data.length > 0) {
            console.log('Colunas detectadas:', Object.keys(data[0]));
            console.log('Exemplo de registro:', data[0]);
        }
    } else {
        console.log(`Aba [${targetSheet}] nao encontrada.`);
    }
} catch (err) {
    console.error('Erro ao ler planilha:', err.message);
}
