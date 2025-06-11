import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import * as schema from "./schema.js";
import { getConfig } from "../config.js";

const config = getConfig();

const conn = postgres(config.db.url);
export const db = drizzle(conn, { schema });

const migrationClient = postgres(config.db.url, {max : 1});
await migrate(drizzle(migrationClient), config.db.migrationConfig);
