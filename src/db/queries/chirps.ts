import { asc } from "drizzle-orm";
import { db } from "../index.js";
import { chirps } from "../schema.js";

export async function createChirp(body: string, userId: string) {
  const [result] = await db
    .insert(chirps)
    .values({
        body: body, 
        userId: userId
    })
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getChirps() {
  return await db.select().from(chirps).orderBy(asc(chirps.createdAt));
}