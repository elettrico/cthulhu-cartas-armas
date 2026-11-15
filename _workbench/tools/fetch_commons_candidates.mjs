import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const queries = JSON.parse(await fs.readFile(path.join(root, '_workbench', 'research', 'queries.json'), 'utf8'));
const outDir = path.join(root, '_workbench', 'research', 'candidates');
await fs.mkdir(outDir, { recursive: true });

const clean = (value) => String(value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    if (response.status !== 429 && response.status < 500) return response;
    await sleep(attempt * 2500);
  }
  return fetch(url, options);
}

for (let index = 0; index < queries.length; index += 1) {
  const item = queries[index];
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: item.query,
    gsrnamespace: '6',
    gsrlimit: '4',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size|mime',
    iiurlwidth: '700',
    format: 'json',
    formatversion: '2',
    origin: '*'
  });
  const apiUrl = `https://commons.wikimedia.org/w/api.php?${params}`;
  const response = await fetchWithRetry(apiUrl, { headers: { 'user-agent': 'CthulhuCardsResearch/1.0' } });
  if (!response.ok) throw new Error(`${item.slug}: Wikimedia API ${response.status}`);
  const json = await response.json();
  const pages = (json.query?.pages ?? []).filter((page) => page.imageinfo?.[0]);
  const records = [];

  for (let candidate = 0; candidate < pages.length; candidate += 1) {
    const page = pages[candidate];
    const info = page.imageinfo[0];
    const ext = info.extmetadata ?? {};
    const imageResponse = await fetchWithRetry(info.thumburl ?? info.url, { headers: { 'user-agent': 'CthulhuCardsResearch/1.0' } });
    if (!imageResponse.ok) continue;
    const contentType = imageResponse.headers.get('content-type') ?? info.mime ?? '';
    const suffix = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const filename = `${String(candidate + 1).padStart(2, '0')}.${suffix}`;
    await fs.writeFile(path.join(outDir, `${item.slug}_${filename}`), Buffer.from(await imageResponse.arrayBuffer()));
    records.push({
      candidate: candidate + 1,
      title: page.title,
      descriptionUrl: info.descriptionurl,
      originalUrl: info.url,
      thumbnail: `${item.slug}_${filename}`,
      width: info.width,
      height: info.height,
      license: clean(ext.LicenseShortName?.value),
      licenseUrl: clean(ext.LicenseUrl?.value),
      artist: clean(ext.Artist?.value),
      credit: clean(ext.Credit?.value),
      description: clean(ext.ImageDescription?.value)
    });
  }

  await fs.writeFile(
    path.join(outDir, `${item.slug}.json`),
    `${JSON.stringify({ ...item, candidates: records }, null, 2)}\n`
  );
  process.stdout.write(`[${index + 1}/${queries.length}] ${item.slug}: ${records.length}\n`);
  await sleep(800);
}

