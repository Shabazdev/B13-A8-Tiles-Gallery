/**
 * Database migration script for Better Auth v1.3.34.
 * Creates the required tables (user, session, account, verification) in SQLite.
 * Run with: node migrate-db.mjs
 *
 * Uses getAuthTables() to dynamically generate the schema from Better Auth itself,
 * so the DDL always matches the installed version.
 */

import { mkdirSync, existsSync, unlinkSync, statSync } from "fs";
import path from "path";
import Database from "better-sqlite3";
import { getAuthTables } from "better-auth";

const databaseUrl = process.env.DATABASE_URL;

function resolveDatabasePath() {
  const rawPath = databaseUrl ? databaseUrl.replace(/^file:/, "") : path.join("db", "tesserae.db");
  const absolutePath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  return absolutePath;
}

const typeMap = {
  string: "TEXT",
  boolean: "INTEGER",
  date: "TEXT",
  number: "INTEGER",
};

function buildCreateTableSQL(modelName, tableDef) {
  const columns = [];
  const indexes = [];

  // Always have an id column as primary key
  columns.push('"id" TEXT PRIMARY KEY');

  for (const [fieldName, field] of Object.entries(tableDef.fields)) {
    if (fieldName === "id") continue;
    const sqlType = typeMap[field.type] || "TEXT";
    let col = `"${fieldName}" ${sqlType}`;
    if (field.required) col += " NOT NULL";
    if (field.defaultValue !== undefined) {
      if (typeof field.defaultValue === "boolean") {
        col += field.defaultValue ? " DEFAULT 1" : " DEFAULT 0";
      } else if (typeof field.defaultValue === "string") {
        col += ` DEFAULT '${field.defaultValue}'`;
      } else if (typeof field.defaultValue === "number") {
        col += ` DEFAULT ${field.defaultValue}`;
      }
    }
    columns.push(col);

    if (field.unique) {
      indexes.push(`CREATE UNIQUE INDEX IF NOT EXISTS "${modelName}_${fieldName}_unique" ON "${modelName}" ("${fieldName}");`);
    }
    if (field.index) {
      indexes.push(`CREATE INDEX IF NOT EXISTS "${modelName}_${fieldName}_idx" ON "${modelName}" ("${fieldName}");`);
    }
  }

  const createSQL = `CREATE TABLE IF NOT EXISTS "${modelName}" (\n  ${columns.join(",\n  ")}\n);`;

  // Handle table-level indexes (for composite unique indexes like account issuer+accountId)
  if (tableDef.indexes) {
    for (const idx of tableDef.indexes) {
      const idxName = `${modelName}_${idx.fields.join("_")}_unique`;
      const fieldsList = idx.fields.map((f) => `"${f}"`).join(", ");
      indexes.push(`CREATE UNIQUE INDEX IF NOT EXISTS "${idxName}" ON "${modelName}" (${fieldsList});`);
    }
  }

  return { createSQL, indexes };
}

async function main() {
  const dbPath = resolveDatabasePath();
  console.log(`[migrate] Database path: ${dbPath}`);

  // Remove empty/corrupted DB file if it exists
  if (existsSync(dbPath) && statSync(dbPath).size === 0) {
    console.log(`[migrate] Removing empty DB file`);
    unlinkSync(dbPath);
  }

  const db = new Database(dbPath);
  console.log(`[migrate] Opened database`);

  // Better Auth configuration (must match lib/auth.ts)
  const config = {
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
  };

  console.log(`[migrate] Getting table schema from Better Auth...`);
  const tables = getAuthTables(config);

  // Sort tables by order to respect foreign key dependencies
  const sortedTables = Object.entries(tables).sort(([, a], [, b]) => a.order - b.order);

  console.log(`[migrate] Creating ${sortedTables.length} tables...`);

  for (const [modelName, tableDef] of sortedTables) {
    const { createSQL, indexes } = buildCreateTableSQL(modelName, tableDef);
    console.log(`\n[migrate] → ${modelName}`);
    db.exec(createSQL);
    for (const idxSQL of indexes) {
      db.exec(idxSQL);
    }
  }

  console.log(`\n[migrate] ✓ All tables created`);

  // Verify tables exist
  const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log(`[migrate] Tables in database:`);
  for (const t of existingTables) {
    console.log(`  - ${t.name}`);
  }

  // Verify row counts (should all be 0)
  for (const [modelName] of sortedTables) {
    const result = db.prepare(`SELECT COUNT(*) as count FROM "${modelName}"`).get();
    console.log(`  ${modelName}: ${result.count} rows`);
  }

  db.close();
  console.log(`\n[migrate] Done`);
}

main().catch((err) => {
  console.error("[migrate] Error:", err);
  process.exit(1);
});
