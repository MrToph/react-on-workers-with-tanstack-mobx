import { z } from "zod";
import { server } from "@passwordless-id/webauthn";
import { t } from "@worker/trpc/trpc-instance";
import { LruCache } from "@worker/db/memory-cache";
import { createJwtToken } from "../jwt";
import type {
  AuthenticationResponseJSON,
  AuthenticatorInfo,
  RegistrationInfo,
  RegistrationJSON,
} from "@passwordless-id/webauthn/dist/esm/types";
import { TRPCError } from "@trpc/server";
import { createUser, getUserByUsername } from "@worker/db/user";
import {
  parseAuthenticator,
  toRegistrationInfo,
} from "@passwordless-id/webauthn/dist/esm/parsers";

type AuthCacheRecord = {
  challenge: string;
  origin: string;
};
const DEFAULT_ORIGIN = "http://localhost:5173";
const Z_USERNAME = z.string().min(1).max(32);

const registerCache = new LruCache<AuthCacheRecord>();
const loginCache = new LruCache<AuthCacheRecord>();

export const authRouter = t.router({
  registerInit: t.procedure
    .input(z.object({ username: Z_USERNAME }))
    .mutation(async ({ input, ctx }) => {
      if (getUserByUsername(input.username)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User already exists",
        });
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
    .mutation(async ({ input, ctx }) => {
      const registration = input.registration as RegistrationJSON;
      const username = registration.user.name;
      console.log(
        `Registering username`,
        username,
        JSON.stringify(registration, null, 2)
      );

      let authenticatorInfo: AuthenticatorInfo | undefined;
      let authenticatorData = registration.response.authenticatorData;
      try {
        // if string is too large, ignore it and don't log it, most likely malicious
        if (
          typeof authenticatorData === "string" &&
          authenticatorData.length < 1024
        ) {
          const authData = parseAuthenticator(authenticatorData);
          const registrationInfo = toRegistrationInfo(registration, authData);
          authenticatorInfo = registrationInfo.authenticator;
        }
      } catch (e) {
        console.log(
          `Failed why trying to parse authenticatorData: ${authenticatorData}.\n${e}`
        );
      }

      const expected = registerCache.get(username);
      if (!expected) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `no challenge found for user ${username}`,
        });
      }

      const verification = await server.verifyRegistration(
        registration,
        expected
      );

      // free memory, prevent replays
      registerCache.delete(username);

      // create user
      createUser(username, verification.credential, authenticatorInfo);

      const jwt = await createJwtToken({ username }, ctx.env.JWT_SECRET);
      return { jwt };
    }),

  loginInit: t.procedure
    .input(z.object({ username: Z_USERNAME }))
    .mutation(async ({ input, ctx }) => {
      const user = getUserByUsername(input.username);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `User does not exist. Register first.`,
        });
      }

      const challenge = server.randomChallenge();

      // reset any current pending signups. is a DoS vector in theory but can be ignored in practice
      loginCache.put(input.username, {
        challenge,
        origin: ctx.env.WEBAUTHN_RELYING_PARTY || DEFAULT_ORIGIN,
      });

      return { challenge, credentials: user.credentials };
    }),

  loginVerify: t.procedure
    .input(z.object({ username: Z_USERNAME, authentication: z.any() }))
    .mutation(async ({ input, ctx }) => {
      const username = input.username;
      const authentication = input.authentication as AuthenticationResponseJSON;
      console.log(`Logging in username`, username);

      const expected = loginCache.get(username);
      const user = getUserByUsername(username);
      if (!expected || !user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `no challenge found for user ${username}`,
        });
      }

      const credentialUsed = user.credentials.find(
        (credential) => credential.id === authentication.id
      );
      if (!credentialUsed) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `credential not found on user ${username}`,
        });
      }

      await server.verifyAuthentication(authentication, credentialUsed, {
        ...expected,
        userVerified: false,
      });

      // free memory, prevent replays
      loginCache.delete(username);

      const jwt = await createJwtToken({ username }, ctx.env.JWT_SECRET);
      return { jwt };
    }),
});
