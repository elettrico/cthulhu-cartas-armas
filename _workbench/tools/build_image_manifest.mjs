import fs from 'node:fs/promises';

const queries = JSON.parse(await fs.readFile('_workbench/research/queries.json', 'utf8'));
const overrides = {
  fusil_aire_moran: 'Girandoni Air Rifle.jpg',
  fn_fal: 'FN FAL rifle.JPG',
  galil: 'Galil front.jpg',
  vickers: 'Vickers Machine Gun, England, 1940s - Glenbow Museum - DSC00824.JPG',
  dinamita: 'A miner detonates a stick of dynamite.jpg',
  m79: 'M79 Grenade launcher.jpg',
  lanzallamas: 'United States Model 2A1 flamethrower.jpg',
  mina_antipersonal: 'Anti-personnel mine at APOPO.jpg',
  mortero81: '81mm L16 mortier.jpg',
};

async function api(host, params) {
  const url = new URL(`https://${host}/w/api.php`);
  for (const [key, value] of Object.entries({ format: 'json', formatversion: '2', ...params })) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, { headers: { 'user-agent': 'coc-cartas-armas/1.0 (local attribution builder)' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

const wiki = await api('en.wikipedia.org', {
  action: 'query',
  prop: 'pageimages',
  piprop: 'name',
  redirects: '1',
  titles: queries.map((item) => item.wikiTitle).join('|'),
});
const pageImages = new Map((wiki.query.pages ?? []).map((page) => [page.title, page.pageimage]));
const normalized = new Map((wiki.query.normalized ?? []).map((item) => [item.from, item.to]));
const redirects = new Map((wiki.query.redirects ?? []).map((item) => [item.from, item.to]));
const resolvedTitle = (title) => redirects.get(normalized.get(title) ?? title) ?? normalized.get(title) ?? title;

const selected = queries.map((item) => ({
  ...item,
  commonsFile: overrides[item.slug] ?? pageImages.get(resolvedTitle(item.wikiTitle)),
}));
const absent = selected.filter((item) => !item.commonsFile);
if (absent.length) throw new Error(`No page image for: ${absent.map((item) => item.slug).join(', ')}`);

const commons = await api('commons.wikimedia.org', {
  action: 'query',
  prop: 'imageinfo',
  iiprop: 'url|extmetadata',
  titles: selected.map((item) => `File:${item.commonsFile}`).join('|'),
});
const key = (name) => name.replace(/^File:/, '').replaceAll('_', ' ').toLocaleLowerCase();
const byTitle = new Map((commons.query.pages ?? []).map((page) => [key(page.title), page]));
const plain = (field) => field?.value?.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() ?? '';
const manifest = selected.map((item) => {
  const page = byTitle.get(key(item.commonsFile));
  const info = page?.imageinfo?.[0];
  const ext = info?.extmetadata ?? {};
  return {
    name: item.name,
    slug: item.slug,
    localFile: `${item.slug}.png`,
    commonsFile: item.commonsFile,
    sourcePage: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.commonsFile).replaceAll('%20', '_')}`,
    originalUrl: info?.url ?? '',
    author: plain(ext.Artist) || plain(ext.Credit) || 'Ver página de origen',
    license: plain(ext.LicenseShortName) || plain(ext.UsageTerms) || 'Ver página de origen',
    licenseUrl: plain(ext.LicenseUrl),
  };
});

await fs.writeFile('_workbench/research/final_manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Manifest: ${manifest.length} images`);
for (const item of manifest) console.log(`${item.slug}\t${item.commonsFile}\t${item.license}`);
