import NextAuth, { User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { Provider } from "next-auth/providers"
import { AuthenticationDetails, CognitoUserPool, CognitoUser, CognitoRefreshToken, CognitoUserSession } from "amazon-cognito-identity-js";
import { isTokenExpired } from "./utils";

const UserPool = new CognitoUserPool({
  UserPoolId: process.env.COGNITO_USER_POOL_ID || '',
  ClientId: process.env.COGNITO_CLIENT_ID || '',
})

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "string", placeholder: "Email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const { email, password } = credentials as { email: string, password: string };
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });
      const user = new CognitoUser({ Username: email, Pool: UserPool });
      return new Promise((resolve, reject) => {
        user.authenticateUser(authDetails, {
          onSuccess: (session) => {
            resolve({
              email: email,
              idToken: session.getIdToken().getJwtToken(),
              accessToken: session.getAccessToken().getJwtToken(),
              refreshToken: session.getRefreshToken().getToken(),
              expiresIn: session.getAccessToken().getExpiration()
            });
          },
          onFailure: (error) => {
            reject(new Error(error.message))
          }
        })
      })
    }
  })
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  callbacks: {
    signIn: async ({ user, account, profile, email, credentials }) => {
      return true
    },
    authorized: async ({ auth, request }) => {
      if (request.nextUrl.pathname.startsWith("/auth")) return true;
      return !!auth
    },
    jwt: async ({ token, user }) => {

      if (user) {
        console.log(user);
        token.accessToken = user.accessToken;
        token.idToken = user.idToken;
        token.refreshToken = user.refreshToken;
        token.expiresIn = user.expiresIn;
      }

      // Check if the token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      const isTokenExpiry = (token.expiresIn && currentTime > (token.expiresIn as number)) || isTokenExpired(token.idToken || '');
      if (isTokenExpiry && token.email) {
        try {
          const user = new CognitoUser({ Username: token.email, Pool: UserPool });
          const refreshSession: CognitoUserSession = await new Promise((resolve, reject) => {
            const refreshToken = new CognitoRefreshToken({ RefreshToken: token.refreshToken || '' });
            user.refreshSession(refreshToken, (err, session) => {
              if (err) reject(err);
              else resolve(session);
            });
          });
          console.log("Refreshing Token");
          token.accessToken = refreshSession.getAccessToken().getJwtToken();
          token.idToken = refreshSession.getIdToken().getJwtToken();
          token.expiresIn = refreshSession.getAccessToken().getExpiration();
        } catch (error) {
          console.error("Failed to refresh token", error);
          return {};
        }
      }
      return token;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  trustHost: true
})