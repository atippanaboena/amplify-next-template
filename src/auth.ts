import NextAuth, { User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { Provider } from "next-auth/providers"
import { AuthenticationDetails, CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js"
import { redirect } from "next/navigation"

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
            const token = {
              idToken: session.getIdToken().getJwtToken(),
              accessToken: session.getAccessToken().getJwtToken(),
              refreshToken: session.getRefreshToken().getToken()
            }
            console.log("Token:", token)
            const user: User = { email: email, name: token.idToken, image: token.refreshToken, id: token.accessToken };
            resolve(user);
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
    strategy: "jwt"
  },
  callbacks: {
    signIn: async ({ user, account, profile, email, credentials }) => {
      console.log("Sign In:", user)
      return true
    },
    authorized: async ({ auth, request }) => {
      if (request.nextUrl.pathname.startsWith("/auth")) return true;
      return !!auth
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
})