import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      tenantId: string;
      role: string;
      plan: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    tenantId: string;
    role: string;
    plan: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    tenantId: string;
    role: string;
    plan: string;
  }
}
