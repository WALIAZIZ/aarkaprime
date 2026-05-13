import { db } from "@/lib/db";
import type { User } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string;
  plan: string;
}

declare module "next-auth" {
  interface Session {
    user: AuthUser;
  }
  interface User {
    role?: string;
    plan?: string;
    company?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    plan: string;
    company?: string;
  }
}
