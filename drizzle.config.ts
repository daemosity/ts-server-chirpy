import { defineConfig } from "drizzle-kit";
import { getConfig } from "./src/config.ts"

const config = getConfig()

export default defineConfig({
  schema: "src/db/schema.ts",
  out: "src/db/migrations/",
  dialect: "postgresql",
  dbCredentials: {
    url: getConfig().db.url
  },
});