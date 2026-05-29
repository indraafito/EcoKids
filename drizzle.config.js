import { existsSync, readFileSync } from 'node:fs';

if (!process.env.DATABASE_URL && existsSync('.env.local')) {
  const envLocal = readFileSync('.env.local', 'utf8');
  const databaseUrlLine = envLocal
    .split(/\r?\n/)
    .find((line) => line.startsWith('DATABASE_URL='));

  if (databaseUrlLine) {
    process.env.DATABASE_URL = databaseUrlLine
      .replace('DATABASE_URL=', '')
      .trim()
      .replace(/^"|"$/g, '');
  }
}

const config = {
  out: './drizzle/migrations',
  schema: './drizzle/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
};

export default config;
