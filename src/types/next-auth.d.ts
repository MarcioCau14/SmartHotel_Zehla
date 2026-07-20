import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import type { PlanTier } from "@/lib/plan-features";
import type { NicheType } from "@/contexts/NicheContext";

declare module "next-auth" {
  interface Session {
    user: {
      tenantId: string;
      role: string;
      plan: PlanTier;
      niche: NicheType;
      isDemoUser?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    tenantId: string;
    role: string;
    plan: PlanTier;
    niche: NicheType;
    isDemoUser?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    tenantId: string;
    role: string;
    plan: PlanTier;
    niche: NicheType;
    isDemoUser?: boolean;
  }
}
