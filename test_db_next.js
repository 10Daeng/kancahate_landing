const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { db } = require('./src/db/index.js');
const schema = require('./src/db/schema.js');

async function test() {
  try {
    const res = await db.select().from(schema.articles);
    console.log("ARTICLES via Drizzle:", res.length);
  } catch (err) {
    console.error("DB ERROR via Drizzle:", err);
  }
}

test();
