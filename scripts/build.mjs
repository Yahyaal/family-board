import { mkdir, readFile, writeFile } from 'node:fs/promises';

const required = ['GOOGLE_CLIENT_ID', 'GROCERY_SHEET_ID', 'MENU_SHEET_ID'];
const missing = required.filter(name => !process.env[name]);
if (missing.length) {
  throw new Error(`Missing GitHub Actions repository variables: ${missing.join(', ')}`);
}

const config = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  sheetId: process.env.GROCERY_SHEET_ID,
  sheetRange: process.env.GROCERY_SHEET_RANGE || 'Groceries!A2:C200',
  menuSheetId: process.env.MENU_SHEET_ID,
  menuSheetRange: process.env.MENU_SHEET_RANGE || 'Mornings!A2:E200',
  ambientClientId: process.env.GOOGLE_PHOTOS_CLIENT_ID || '',
  idleMinutes: Math.max(1, Number(process.env.PHOTO_IDLE_MINUTES) || 5),
};

const source = await readFile('index.html', 'utf8');
const marker = '/*__DEPLOYED_CONFIG__*/ {}';
if (!source.includes(marker)) throw new Error('Deployment configuration marker is missing from index.html.');

const built = source.replace(marker, `/* injected by GitHub Actions */ ${JSON.stringify(config)}`);
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', built);
