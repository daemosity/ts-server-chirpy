import { db } from "../index.js";
import { chirps } from "../schema.js";
export async function createChirp(body, userId) {
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
