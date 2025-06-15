import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { refreshTokens } from "../schema.js";

export async function createRefreshToken(refreshToken: string, userId: string) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 60);
  
    await db.insert(refreshTokens).values({
        id: refreshToken,
        userId: userId,
        expiresAt: expDate
})
}

export async function getRefreshTokenInfo(refreshToken: string) {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.id, refreshToken));
    return result;
}

export async function revokeRefreshToken(refreshToken: string) {
    const [result] = await db.update(refreshTokens).set({revokedAt: new Date()}).where(eq(refreshTokens.id, refreshToken)).returning();
    return result;
}