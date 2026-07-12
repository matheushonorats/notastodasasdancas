function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('VI Todas as Danças - Sistema de Apuração')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function fetchAllData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    const sheetCoreos = ss.getSheetByName('Coreografias');
    const sheetNotas = ss.getSheetByName('Notas');
    
    if (!sheetCoreos || !sheetNotas) {
      return JSON.stringify({
        status: 'error',
        message: 'Aba Coreografias ou Notas não foi encontrada.'
      });
    }
    
    const coreografias = sheetToJSON(sheetCoreos);
    const notas = sheetToJSON(sheetNotas);
    
    let ordemSalva = [];
    const sheetOrdem = ss.getSheetByName('Ordem_Relatorio');
    if (sheetOrdem) {
      ordemSalva = sheetOrdem.getDataRange().getValues().map(r => r[0]).filter(Boolean);
    }
    
    return JSON.stringify({
      status: 'success',
      coreografias: coreografias,
      notas: notas,
      ordemRelatorio: ordemSalva
    });
  } catch (err) {
    return JSON.stringify({
      status: 'error',
      message: err.message
    });
  }
}

function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return [];
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

function saveOrdemRelatorioNoServer(jsonOrdem) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Ordem_Relatorio');
    if (!sheet) {
      sheet = ss.insertSheet('Ordem_Relatorio');
      sheet.hideSheet(); // Mantém a aba invisível para não poluir o Sheets
    }
    sheet.clearContents();
    const ordem = JSON.parse(jsonOrdem);
    if (ordem.length > 0) {
      const rows = ordem.map(item => [item]);
      sheet.getRange(1, 1, rows.length, 1).setValues(rows);
    }
    return JSON.stringify({ status: 'success' });
  } catch (err) {
    return JSON.stringify({ status: 'error', message: err.message });
  }
}