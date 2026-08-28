import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/types";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.managerId = user.managerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = token.role;
        session.user.managerId = token.managerId;
        session.user.name = token.name;
        session.user.email = token.email ?? "";
        session.user.image = (token.picture as string | undefined) ?? undefined;
      }
      return session;
    },
  },
};
