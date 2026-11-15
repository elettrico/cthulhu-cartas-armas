import fs from 'node:fs/promises';
import path from 'node:path';

const dir = 'assets/weapons';
const manifest = JSON.parse(await fs.readFile('_workbench/research/final_manifest.json', 'utf8'));
const known = new Map(manifest.map((item) => [item.localFile, item]));
const generatedActive = new Set([
  'bren.png',
  'canon_naval5.png',
  'canon_naval5_v2.png',
  'canon_tanque120.png',
  'escopeta20.png',
  'fusil_aire_moran.png',
  'gatling_1882.png',
  'gatling_1882_v2.png',
  'lewis.png',
  'm79.png',
  'mac11.png',
  'mp5.png',
  'mp18_mp28.png',
  'pistola_bengalas.png',
  'spas12.png',
  'skorpion.png',
  'thompson.png',
  'vickers.png',
]);
const generatedOriginalActive = new Set([
  'baston_pistola_410.png',
  'browning_m1917.png',
  'c4.png',
  'detonador.png',
  'gewehr98.png',
  'galil.png',
  'granada_mano.png',
  'lanzacohetes.png',
  'mauser_c96.png',
  'mina_antipersonal.png',
  'minigun.png',
  'molotov.png',
  'mortero81.png',
  'webley_mkvi.png',
  'winchester_1890.png',
]);
const projectIllustrationActive = new Set(['bomba_casera.png', 'dinamita.png']);
const extractedActive = new Set([
  'canon75.png',
  'fusilcerrojo.png',
  'fusilelefante.png',
]);
const files = (await fs.readdir(dir)).filter((name) => name.endsWith('.png')).sort((a, b) => a.localeCompare(b));
const lines = [
  'LICENCIAS Y FUENTES DE LAS IMÁGENES DE ARMAS',
  '==============================================',
  '',
  'Las imágenes normalizadas se guardan en formato PNG. Cada licencia indicada',
  'corresponde a la imagen fuente; las adaptaciones consisten principalmente en',
  'redimensionado, centrado, recorte o eliminación del fondo.',
  '',
];

for (const file of files) {
  lines.push(file);
  lines.push('-'.repeat(file.length));
  const versionedBase = file.match(/^(gatling_1882|canon_naval5)_v2\.png$/)?.[1];
  const item = known.get(file) ?? (versionedBase ? known.get(`${versionedBase}.png`) : null);
  if (generatedOriginalActive.has(file)) {
    lines.push('Tipo: imagen original generada con OpenAI');
    lines.push('Fuente externa/licencia: no aplica; no se incorporó una imagen de terceros.');
  } else if (projectIllustrationActive.has(file)) {
    lines.push('Tipo: ilustración vectorial original creada para este proyecto y rasterizada a PNG');
    lines.push('Fuente externa/licencia: no aplica; no se incorporó una imagen de terceros.');
  } else if (generatedActive.has(file) && item) {
    lines.push('Tipo: imagen generada con OpenAI a partir de una referencia visual');
    lines.push(`Referencia: ${item.sourcePage}`);
    lines.push(`Autoría de la referencia: ${String(item.author).replace(/\s+/g, ' ').trim()}`);
    lines.push(`Licencia de la referencia: ${item.license}${item.licenseUrl ? ` — ${item.licenseUrl}` : ''}`);
    lines.push('Nota: conservar esta atribución junto con la imagen generada.');
  } else if (extractedActive.has(file) && item) {
    lines.push('Tipo: recorte del archivo original con eliminación de fondo');
    lines.push(`Fuente: ${item.sourcePage}`);
    lines.push(`Autoría: ${String(item.author).replace(/\s+/g, ' ').trim()}`);
    lines.push(`Licencia: ${item.license}${item.licenseUrl ? ` — ${item.licenseUrl}` : ''}`);
  } else if (item) {
    lines.push(`Fuente: ${item.sourcePage}`);
    lines.push(`Autoría: ${String(item.author).replace(/\s+/g, ' ').trim()}`);
    lines.push(`Licencia: ${item.license}${item.licenseUrl ? ` — ${item.licenseUrl}` : ''}`);
  } else {
    lines.push('Fuente/licencia: no consta en este proyecto; imagen heredada del mazo nanDECK.');
  }
  lines.push('');
}

await fs.writeFile(path.join(dir, 'licencias.txt'), `${lines.join('\n')}\n`);
console.log(`licencias.txt: ${files.length} archivos documentados`);
