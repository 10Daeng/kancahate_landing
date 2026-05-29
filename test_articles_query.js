const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_8PcB9KVZAvXW@ep-aged-pond-a11axkgm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function test() {
  try {
    const res = await sql`select "id", "title", "slug", "excerpt", "content", "category", "cover_image", "status", "author_id", "author_name", "view_count", "tags", "published_at", "created_at", "updated_at" from "articles" order by "articles"."created_at" desc`;
    console.log("Success! Found:", res.length);
  } catch (err) {
    console.error("Query Error:", err);
  }
}
test();
