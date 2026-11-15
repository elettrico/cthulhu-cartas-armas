import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const manifest = JSON.parse(await fs.readFile('_workbench/research/final_manifest.json', 'utf8'));
const images = new Map(manifest.map((item) => [item.name, item.localFile]));
const input = await FileBlob.load('data/armas.xlsx');
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItemAt(0);
const names = sheet.getRange('A2:A77').values.flat();
const current = sheet.getRange('J2:J77').values.flat();
const updated = names.map((name, index) => [images.get(String(name)) ?? current[index] ?? null]);
const changed = updated.filter((row, index) => row[0] !== current[index]).length;
if (changed !== 42) throw new Error(`Expected 42 updated image cells, got ${changed}`);

sheet.getRange('J2:J77').values = updated;
workbook.recalculate();
const preview = await workbook.render({ sheetName: sheet.name, range: 'A1:J77', scale: 1, format: 'png' });
await fs.writeFile('_workbench/research/workbook-after.png', new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save('data/armas.updated.xlsx');
console.log((await workbook.inspect({ kind: 'region', sheetId: sheet.name, range: 'A1:J77', maxChars: 12000, tableMaxRows: 80, tableMaxCols: 10 })).ndjson);
console.log(`Updated ${changed} image cells`);
