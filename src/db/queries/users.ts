import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, UserInfo, users } from "../schema.js";

type SafeUserInfo = Omit<UserInfo, 'hashedPassword'>;

export async function createUser(user: NewUser): Promise<SafeUserInfo> {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  const {hashedPassword, ...safeUserObj} = result;
  return safeUserObj;
}

export async function getUserByEmail(email: string): Promise<UserInfo> {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
  return result;
}

export async function deleteAllUsers() {
    await db.delete(users);
    console.log(`table users TRUNCATED`)
};