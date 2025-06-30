import { z } from "zod";
import { server } from "@passwordless-id/webauthn";
import { t } from "@worker/trpc/trpc-instance";
import { LruCache } from "@worker/db/memory-cache";
import type { AuthenticationResponseJSON } from "@passwordless-id/webauthn/dist/esm/types";

type RegistrationDataType = Parameters<typeof server.verifyRegistration>[0];

type AuthCacheRecord = {
  challenge: string;
  origin: string;
};
const DEFAULT_ORIGIN = "http://localhost:5173";
const Z_USERNAME = z.string().min(1).max(32);

const registerCache = new LruCache<AuthCacheRecord>();
const loginCache = new LruCache<AuthCacheRecord>();
const USERS: Record<string, { credentials: any[] }> = {};

export const authRouter = t.router({
  registerInit: t.procedure
    .input(z.object({ username: Z_USERNAME }))
    .mutation(async ({ input, ctx }) => {
      if (USERS[input.username]) {
        throw new Error("User already exists");
      }

      const challenge = server.randomChallenge();

      // reset any current pending signups. is a DoS vector in theory but can be ignored in practice
      registerCache.put(input.username, {
        challenge,
        origin: ctx.env.WEBAUTHN_RELYING_PARTY || DEFAULT_ORIGIN,
      });

      return { challenge };
    }),

  registerVerify: t.procedure
    .input(z.object({ registration: z.any() }))
    .mutation(async ({ input }) => {
      const registration = input.registration as RegistrationDataType;
      const username = registration.user.name;
      console.log(`username`, username);

      const expected = registerCache.get(username);
      if (!expected) {
        throw new Error(`no challenge found for user ${username}`);
      }

      const verification = await server.verifyRegistration(
        registration,
        expected
      );

      // free memory, prevent replays
      registerCache.delete(username);

      // create user
      USERS[username] = { credentials: [verification.credential] };

      // TODO: return JWT auth token
      return { jwt: "jwt" };
    }),

  loginInit: t.procedure
    .input(z.object({ username: Z_USERNAME }))
    .mutation(async ({ input, ctx }) => {
      if (!USERS[input.username]) {
        throw new Error("User does not exist. Register first.");
      }

      const challenge = server.randomChallenge();

      // reset any current pending signups. is a DoS vector in theory but can be ignored in practice
      loginCache.put(input.username, {
        challenge,
        origin: ctx.env.WEBAUTHN_RELYING_PARTY || DEFAULT_ORIGIN,
      });

      return { challenge, credentials: USERS[input.username].credentials };
    }),

  loginVerify: t.procedure
    .input(z.object({ username: Z_USERNAME, authentication: z.any() }))
    .mutation(async ({ input }) => {
      const username = input.username;
      const authentication = input.authentication as AuthenticationResponseJSON;
      console.log(`username`, username);

      const expected = loginCache.get(username);
      if (!expected || !USERS[username]) {
        throw new Error(`no challenge found for user ${username}`);
      }

      const credentialUsed = USERS[username].credentials.find(
        (credential) => credential.id === authentication.id
      );
      if (!credentialUsed) {
        throw new Error(`credential not found on user ${username}`);
      }

      await server.verifyAuthentication(
        authentication,
        credentialUsed,
        { ...expected, userVerified: false },
      );

      // free memory, prevent replays
      loginCache.delete(username);

      // TODO: return JWT auth token
      return { jwt: "jwt" };
    }),
});
