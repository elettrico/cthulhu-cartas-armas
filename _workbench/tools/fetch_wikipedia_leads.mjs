import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const items = JSON.parse(await fs.readFile(path.join(root, '_workbench', 'research', 'queries.json'), 'utf8'));
const outDir = path.join(root, '_workbench', 'research', 'leads');
await fs.mkdir(outDir, { recursive: true });
const indexPath = path.join(outDir, 'index.json');
const previous = new Map();
try {
  for (const record of JSON.parse(await fs.readFile(indexPath, 'utf8'))) previous.set(record.slug, record);
} catch {}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const result = await fetch(url, options);
    if (result.ok || result.status !== 429) return result;
    await sleep(attempt * 3000);
  }
  return fetch(url, options);
}

const params = new URLSearchParams({
  action: 'query',
  prop: 'pageimages|info',
  inprop: 'url',
  piprop: 'thumbnail|original|name',
  pithumbsize: '1000',
  redirects: '1',
  titles: items.map((item) => item.wikiTitle).join('|'),
  format: 'json',
  formatversion: '2',
  origin: '*'
});

const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
  headers: { 'user-agent': 'CthulhuCardsResearch/1.0' }
});
if (!response.ok) throw new Error(`Wikipedia API ${response.status}`);
const json = await response.json();
const normalized = new Map();
for (const entry of json.query?.normalized ?? []) normalized.set(entry.from, entry.to);
for (const entry of json.query?.redirects ?? []) normalized.set(entry.from, entry.to);
const pages = new Map((json.query?.pages ?? []).map((page) => [page.title, page]));

const resolveTitle = (title) => {
  let current = title;
  for (let i = 0; i < 5 && normalized.has(current); i += 1) current = normalized.get(current);
  return current;
};

const records = [];
for (let index = 0; index < items.length; index += 1) {
  const item = items[index];
  const old = previous.get(item.slug);
  if (old?.status === 'ok' && old.localFile) {
    try {
      await fs.access(path.join(outDir, old.localFile));
      records.push(old);
      continue;
    } catch {}
  }
  const page = pages.get(resolveTitle(item.wikiTitle));
  if (!page?.thumbnail?.source) {
    records.push({ ...item, status: 'missing-lead' });
    continue;
  }
  const imageResponse = await fetchWithRetry(page.thumbnail.source, {
    headers: { 'user-agent': 'CthulhuCardsResearch/1.0' }
  });
  if (!imageResponse.ok) {
    records.push({ ...item, status: `download-${imageResponse.status}`, pageUrl: page.fullurl });
    continue;
  }
  const contentType = imageResponse.headers.get('content-type') ?? '';
  const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const localFile = `${item.slug}.${extension}`;
  await fs.writeFile(path.join(outDir, localFile), Buffer.from(await imageResponse.arrayBuffer()));
  records.push({
    ...item,
    status: 'ok',
    resolvedTitle: page.title,
    pageUrl: page.fullurl,
    commonsFile: page.pageimage,
    imageUrl: page.original?.source ?? page.thumbnail.source,
    localFile
  });
  process.stdout.write(`[${index + 1}/${items.length}] ${item.slug}\n`);
  await sleep(750);
}

await fs.writeFile(indexPath, `${JSON.stringify(records, null, 2)}\n`);

