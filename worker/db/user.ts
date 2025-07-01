import type {
  AuthenticatorInfo,
  CredentialInfo,
} from "@passwordless-id/webauthn/dist/esm/types";
import type { DB } from "./db.types";
import { users } from "./schemas";
import { eq } from "drizzle-orm";

export type UserCredential = CredentialInfo & {
  authenticatorInfo?: AuthenticatorInfo;
};

export async function getUserByUsername(db: DB, username: string) {
  return db.select().from(users).where(eq(users.username, username)).get();
}

export async function createUser(
  db: DB,
  username: string,
  initialCredential: CredentialInfo,
  authenticatorInfo?: AuthenticatorInfo
) {
  const credential = { ...initialCredential, authenticatorInfo };

  await db
    .insert(users)
    .values({
      username,
      credentials: [credential],
    })
    .run();
}

export async function addPassKeyToUser(
  db: DB,
  username: string,
  credential: CredentialInfo,
  authenticatorInfo?: AuthenticatorInfo
) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();
  if (!user) {
    throw new Error(`User ${username} not found`);
  }
  await db
    .update(users)
    .set({
      credentials: [...user.credentials, { ...credential, authenticatorInfo }],
    })
    .where(eq(users.username, username))
    .run();
}
