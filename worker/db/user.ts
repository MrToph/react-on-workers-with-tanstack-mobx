import type { CredentialInfo } from "@passwordless-id/webauthn/dist/esm/types";

const USERS: Record<string, { username: string; credentials: CredentialInfo[] }> = {};

export function getUserByUsername(username: string) {
  return USERS[username];
}

export function createUser(username: string, initialCredential: CredentialInfo) {
  USERS[username] = { username, credentials: [initialCredential] };
}
