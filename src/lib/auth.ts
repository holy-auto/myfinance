import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: { roles: { include: { role: true } } },
          });

          if (!user || !user.isActive || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!isValid) return null;

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          const allPermissions = user.roles.flatMap(
            (ur: { role: { permissions: string } }) =>
              ur.role.permissions.split(",").map((p: string) => p.trim()).filter(Boolean)
          );
          const uniquePermissions = [...new Set(allPermissions)];

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles.map((ur: { role: { name: string } }) => ur.role.name),
            permissions: uniquePermissions,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as unknown as { roles: string[] }).roles;
        token.permissions = (user as unknown as { permissions: string[] }).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { roles: string[] }).roles =
          (token.roles as string[]) ?? [];
        (session.user as unknown as { permissions: string[] }).permissions =
          (token.permissions as string[]) ?? [];
      }
      return session;
    },
  },
});
