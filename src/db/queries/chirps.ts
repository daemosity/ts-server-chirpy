import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps } from "../schema.js";
import { createDiffieHellmanGroup } from "node:crypto";

export async function createChirp(body: string, userId: string) {
  console.log("body", body, "userID", userId);
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

export async function getChirpById(chirpID: string) {
  const [chirp] = await db.select().from(chirps).where(eq(chirps.id, chirpID));
  return chirp;
}

export async function deleteChirp(chirpID: string) {
  const [result] = await db.delete(chirps).where(eq(chirps.id, chirpID)).returning();
  return result;
}