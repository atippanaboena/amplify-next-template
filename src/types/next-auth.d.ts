import { type DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  }
}

declare module 'next-auth' {
  interface User extends DefaultSession['user'] {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn: number;
  }
  interface Account {
    user: {
      accessToken: string;
      idToken: string;
      refreshToken: string;
      expiresIn: number;
    } & DefaultSession['user'];
  }
  interface Session {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn: number;
    user: DefaultSession['user'];
  }
}