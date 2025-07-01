import type { AuthenticatorInfo, CredentialInfo } from "@passwordless-id/webauthn/dist/esm/types";

type Credential = CredentialInfo & { authenticatorInfo?: AuthenticatorInfo };
const USERS: Record<string, { username: string; credentials: Credential[] }> = {};

export function getUserByUsername(username: string) {
  return USERS[username];
}

export function createUser(username: string, initialCredential: CredentialInfo, authenticatorInfo?: AuthenticatorInfo) {
  USERS[username] = { username, credentials: [{ ...initialCredential, authenticatorInfo }] };
}

export function addPassKeyToUser(username: string, credential: CredentialInfo, authenticatorInfo?: AuthenticatorInfo) {
  const user = USERS[username];
  if (!user) {
    throw new Error(`User ${username} not found`);
  }
  user.credentials.push({ ...credential, authenticatorInfo });
}
