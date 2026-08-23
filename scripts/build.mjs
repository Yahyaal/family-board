import { mkdir, readFile, writeFile } from 'node:fs/promises';

/* These drive the Google integration. Without them the board still builds and
   deploys, it just runs on demo data until the variables are added — the page
   already handles a missing client ID by sending you to Settings. */
const expected = ['GOOGLE_CLIENT_ID', 'GROCERY_SHEET_ID', 'MENU_SHEET_ID'];
const missing = expected.filter(name => !process.env[name]);
if (missing.length) {
  console.warn(`::warning::Building without ${missing.join(', ')}. The board will deploy with demo data only. Set these under Settings > Secrets and variables > Actions > Variables.`);
}

const config = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  sheetId: process.env.GROCERY_SHEET_ID || '',
  sheetRange: process.env.GROCERY_SHEET_RANGE || 'Groceries!A2:C200',
  menuSheetId: process.env.MENU_SHEET_ID || '',
  menuSheetRange: process.env.MENU_SHEET_RANGE || 'Mornings!A2:E200',
  ambientClientId: process.env.GOOGLE_PHOTOS_CLIENT_ID || '',
  idleMinutes: Math.max(1, Number(process.env.PHOTO_IDLE_MINUTES) || 5),
  reloadMinutes: Math.max(15, Number(process.env.PAGE_RELOAD_MINUTES) || 360),
};

const source = await readFile('index.html', 'utf8');
const marker = '/*__DEPLOYED_CONFIG__*/ {}';
if (!source.includes(marker)) throw new Error('Deployment configuration marker is missing from index.html.');

const built = source.replace(marker, `/* injected by GitHub Actions */ ${JSON.stringify(config)}`);
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', built);
