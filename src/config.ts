import { type MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile(".env")

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
}

type APIConfig = {
  fileserverHits: number;
  platform: string;
  serverSecret: string;
  polkaKey: string;
  db: DBConfig;
};

export function envOrThrow(key: string) {
    const dbUrl = process.env[key];
    if (!dbUrl) {
        throw new Error("No dbURL property; exiting program");
    }

    return dbUrl;
}

export const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export function getConfig(): APIConfig {
  const dbURL = envOrThrow("DB_URL");
  const platform = envOrThrow("PLATFORM");
  const secret = envOrThrow("SERVER_SECRET");
  const polkaKey = envOrThrow("POLKA_KEY");
  
  return {
    fileserverHits: 0,
    platform: platform,
    serverSecret: secret,
    polkaKey: polkaKey,
    db: {
      url: dbURL,
      migrationConfig: migrationConfig
    }
  };
}
