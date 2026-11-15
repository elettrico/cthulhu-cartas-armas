import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const inputPath = 'data/armas.xlsx';
const mode = process.argv[2] ?? 'inspect';

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sheet = workbook.worksheets.getItemAt(0);

if (mode === 'inspect') {
  const summary = await workbook.inspect({
    kind: 'workbook,sheet,table',
    maxChars: 6000,
    tableMaxRows: 8,
    tableMaxCols: 16,
    tableMaxCellChars: 100,
  });
  console.log(summary.ndjson);
  const tail = await workbook.inspect({
    kind: 'region',
    sheetId: sheet.name,
    range: 'A70:Q82',
    maxChars: 8000,
  });
  console.log(tail.ndjson);
  const preview = await workbook.render({
    sheetName: sheet.name,
    range: 'A1:Q18',
    scale: 1.5,
    format: 'png',
  });
  await fs.writeFile('_workbench/research/workbook-before.png', new Uint8Array(await preview.arrayBuffer()));
}

if (mode === 'edit') {
  const newWeapons = [
    ['Pistola Mauser C96', 'Arma corta', '1D8 + 1', '15 m', '1 (3)', '10', '8 £ (1890s)', '96', '1890s, años 20', 'mauser_c96.png', 'pistol'],
    ['Revólver Webley Mk VI .455', 'Arma corta', '1D10 + 2', '15 m', '1 (3)', '6', '5 £ (1890s)', '99', 'años 20', 'webley_mkvi.png', 'pistol'],
    ['Fusil Winchester 1890 .22', 'Fusil', '1D6 + 1', '30 m', '1', '22', '3 £ 2 s (1890s)', '98', '1890s, años 20', 'winchester_1890.png', 'rifle'],
    ['Fusil Mauser Gewehr 98', 'Fusil', '2D6 + 4', '110 m', '1', '5', '7 £ (1890s)', '99', 'años 20', 'gewehr98.png', 'rifle'],
    ['Bastón pistola .410', 'Fusil', '1D10+1 o 2D6/1D6/1D3', '5 m', '1/3', '1', '2 £ 6 s (1890s)', '99', '1890s, años 20, rara', 'baston_pistola_410.png', 'rifle'],
  ];

  console.log('EDIT_STEP: preparing destination');
  const destination = sheet.getRange('A78:K82');
  console.log('EDIT_STEP: destination ready');
  destination.copyFrom(sheet.getRange('A77:K77'), 'all');
  console.log('EDIT_STEP: format copied');
  destination.values = newWeapons;
  console.log('EDIT_STEP: rows written');
  workbook.recalculate();
  console.log('EDIT_STEP: recalculated');

  const tail = await workbook.inspect({
    kind: 'table',
    range: `${sheet.name}!A73:K82`,
    include: 'values,formulas',
    tableMaxRows: 12,
    tableMaxCols: 11,
    maxChars: 12000,
  });
  console.log(tail.ndjson);
  console.log('EDIT_STEP: tail inspected');

  const errors = await workbook.inspect({
    kind: 'match',
    searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
    options: { useRegex: true, maxResults: 300 },
    summary: 'final formula error scan',
  });
  console.log(errors.ndjson);
  console.log('EDIT_STEP: errors scanned');

  const preview = await workbook.render({
    sheetName: sheet.name,
    range: 'A72:K82',
    scale: 1.5,
    format: 'png',
  });
  await fs.writeFile('_workbench/research/workbook-after.png', new Uint8Array(await preview.arrayBuffer()));
  console.log('EDIT_STEP: preview rendered');

  await fs.mkdir('outputs/extend-81-weapons', { recursive: true });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  console.log('EDIT_STEP: xlsx exported');
  const deliverable = 'outputs/extend-81-weapons/armas.xlsx';
  await fs.writeFile(deliverable, output.data);
  await fs.copyFile(deliverable, inputPath);
  console.log(`Workbook exported to ${deliverable} and ${inputPath}`);
}
