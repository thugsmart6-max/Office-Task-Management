import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authConfig } from "@/lib/auth.config";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { JobRole, Role } from "@/types";

function bootstrapRole(email: string, userCount: number, isExistingOnlyUser: boolean): Role {
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();
  if (adminEmail && email.toLowerCase() === adminEmail) return "admin";
  // First Google account, or the only person in the office, is admin.
  if (userCount === 0 || isExistingOnlyUser) return "admin";
  return "user";
}

function googleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

const google = googleCredentials();
const providers = google
  ? [
      Google({
        ...google,
        allowDangerousEmailAccountLinking: true,
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      await connectDB();
      const email = user.email.toLowerCase();
      let existing = await User.findOne({ email });
      const userCount = await User.countDocuments();
      const access = bootstrapRole(email, userCount, Boolean(existing) && userCount === 1);

      if (!existing) {
        existing = await User.create({
          name: user.name || email.split("@")[0],
          email,
          image: user.image ?? undefined,
          role: access,
          jobRole: access === "admin" ? "admin" : undefined,
          onboarded: access === "admin",
        });
      } else {
        if (access === "admin" && existing.role !== "admin") {
          existing.role = "admin";
          existing.onboarded = true;
          existing.jobRole = existing.jobRole || "admin";
          existing.managerId = undefined;
        }
        if (user.image && existing.image !== user.image) {
          existing.image = user.image;
        }
        await existing.save();
      }

      user.id = existing._id.toString();
      user.role = existing.role;
      user.managerId = existing.managerId?.toString();
      user.jobRole = existing.jobRole;
      user.onboarded = existing.onboarded !== false;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as Role) || "user";
        token.managerId = user.managerId;
        token.jobRole = user.jobRole as JobRole | undefined;
        token.onboarded = user.onboarded !== false;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      const email = token.email ? String(token.email).toLowerCase() : "";
      if (email) {
        await connectDB();
        const dbUser = await User.findOne({ email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.managerId = dbUser.managerId?.toString();
          token.jobRole = dbUser.jobRole;
          token.onboarded = dbUser.onboarded !== false;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = token.role;
        session.user.managerId = token.managerId;
        session.user.jobRole = token.jobRole;
        session.user.onboarded = token.onboarded !== false;
        session.user.name = token.name;
        session.user.email = token.email ?? "";
        session.user.image = (token.picture as string | undefined) ?? undefined;
      }
      return session;
    },
  },
});
