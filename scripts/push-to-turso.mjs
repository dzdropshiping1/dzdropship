/**
 * push-to-turso.mjs
 * 
 * This script creates all necessary tables in Turso (libSQL).
 * Run with: node scripts/push-to-turso.mjs
 * 
 * It reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from .env
 */

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env manually (no dotenv needed)
function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  const content = readFileSync(envPath, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

const env = loadEnv();
const url = env.TURSO_DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌  Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env');
  process.exit(1);
}

const client = createClient({ url, authToken });

// DDL statements matching prisma/schema.prisma models
const statements = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id"        TEXT    NOT NULL PRIMARY KEY,
    "email"     TEXT    NOT NULL UNIQUE,
    "password"  TEXT    NOT NULL,
    "name"      TEXT    NOT NULL,
    "createdAt" TEXT    NOT NULL DEFAULT (datetime('now')),
    "updatedAt" TEXT    NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS "Order" (
    "id"                   TEXT    NOT NULL PRIMARY KEY,
    "customerName"         TEXT    NOT NULL,
    "customerPhone"        TEXT    NOT NULL,
    "customerWilaya"       TEXT    NOT NULL,
    "customerAddress"      TEXT    NOT NULL,
    "productName"          TEXT    NOT NULL,
    "source"               TEXT    NOT NULL,
    "costPriceDzd"         REAL    NOT NULL,
    "sellingPriceDzd"      REAL    NOT NULL,
    "shippingPriceDzd"     REAL    NOT NULL,
    "paymentMethod"        TEXT    NOT NULL,
    "onlineAmount"         REAL    NOT NULL DEFAULT 0.0,
    "codAmount"            REAL    NOT NULL DEFAULT 0.0,
    "paymentStatus"        TEXT    NOT NULL,
    "shippingStatus"       TEXT    NOT NULL,
    "sofizPayPaymentId"    TEXT    UNIQUE,
    "sofizPayCheckoutUrl"  TEXT,
    "trackingCode"         TEXT,
    "userId"               TEXT,
    "createdAt"            TEXT    NOT NULL DEFAULT (datetime('now')),
    "updatedAt"            TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "PaymentLog" (
    "id"             TEXT    NOT NULL PRIMARY KEY,
    "orderId"        TEXT    NOT NULL,
    "sofizPayId"     TEXT    NOT NULL,
    "amount"         REAL    NOT NULL,
    "status"         TEXT    NOT NULL,
    "paymentMethod"  TEXT    NOT NULL,
    "reconciled"     INTEGER NOT NULL DEFAULT 0,
    "reconciledAt"   TEXT,
    "createdAt"      TEXT    NOT NULL DEFAULT (datetime('now')),
    "updatedAt"      TEXT    NOT NULL DEFAULT (datetime('now'))
  )`,
];

console.log(`🔗  Connecting to Turso: ${url}`);

for (const sql of statements) {
  const tableName = sql.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1];
  try {
    await client.execute(sql);
    console.log(`✅  Table "${tableName}" — OK`);
  } catch (err) {
    console.error(`❌  Table "${tableName}" — FAILED:`, err.message);
    process.exit(1);
  }
}

console.log('\n🎉  All tables created successfully in Turso!');
client.close();
