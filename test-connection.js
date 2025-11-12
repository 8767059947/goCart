import pg from "pg";

const client = new pg.Client({
  connectionString:
    "postgresql://neondb_owner:<your_password>@ep-ancient-field-a1cjs77u-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
});

client
  .connect()
  .then(() => console.log("✅ Connected successfully!"))
  .catch((err) => console.error("❌ Connection failed:", err))
  .finally(() => client.end());
