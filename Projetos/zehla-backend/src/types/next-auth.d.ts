import "next-auth";
import { DefaultSession } from "next-auth";


declare module "next-auth" {
  interface User {
    role: string;
    tenantId: string | null;
  }

  interface Session {
    user: {
      role: string;
      tenantId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    tenantId: string | null;
  }
}
