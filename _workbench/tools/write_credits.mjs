import fs from 'node:fs/promises';

const items = JSON.parse(await fs.readFile('_workbench/research/final_manifest.json', 'utf8'));
const cell = (value) => String(value || '—').replace(/\s+/g, ' ').replaceAll('|', '\\|').trim();
const rows = items.map((item) => {
  const license = item.licenseUrl ? `[${cell(item.license)}](${item.licenseUrl})` : cell(item.license);
  return `| ${cell(item.name)} | [${cell(item.commonsFile)}](${item.sourcePage}) | ${cell(item.author)} | ${license} |`;
});
const text = `# Créditos de las imágenes añadidas

Estas 42 ilustraciones proceden de Wikimedia Commons. Para incorporarlas al
mazo se redimensionaron proporcionalmente y se centraron sobre un lienzo
blanco de 1200 × 600 px; no se alteró el contenido más allá de esa adaptación
de formato.

Cada imagen conserva la licencia indicada en su página de origen. Las licencias
son individuales y prevalecen sobre cualquier licencia general del proyecto.

| Carta | Archivo de origen | Autoría | Licencia |
|---|---|---|---|
${rows.join('\n')}
`;
await fs.writeFile('CREDITS.md', text);
console.log(`CREDITS.md: ${items.length} imágenes`);
