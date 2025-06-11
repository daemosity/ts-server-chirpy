process.loadEnvFile(".env");
export function envOrThrow(key) {
    const dbUrl = process.env[key];
    if (!dbUrl) {
        throw new Error("No dbURL property; exiting program");
    }
    return dbUrl;
}
export const migrationConfig = {
    migrationsFolder: "./src/db/migrations",
};
export function getConfig() {
    const dbURL = envOrThrow("DB_URL");
    const platform = envOrThrow("PLATFORM");
    return {
        fileserverHits: 0,
        platform: platform,
        db: {
            url: dbURL,
            migrationConfig: migrationConfig
        }
    };
}
