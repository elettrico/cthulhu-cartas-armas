import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const input = await FileBlob.load('data/armas.xlsx');
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItemAt(0);
const preview = await workbook.render({ sheetName: sheet.name, range: 'A1:J77', scale: 1, format: 'png' });
await fs.writeFile('_workbench/research/workbook-before.png', new Uint8Array(await preview.arrayBuffer()));
console.log((await workbook.inspect({ kind: 'region', sheetId: sheet.name, range: 'A1:J8', maxChars: 5000 })).ndjson);
