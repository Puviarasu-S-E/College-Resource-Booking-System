import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

export const authResolvers = {
  Query: {
    // Returns the currently logged-in user from context
    me: (_: unknown, __: unknown, ctx: { user: { id: number; role: string } | null }) => {
      if (!ctx.user) return null;
      return prisma.user.findUnique({ where: { id: ctx.user.id } });
    },
  },

  Mutation: {
    // Creates a new user account
    register: async (_: unknown, args: { name: string; email: string; password: string }) => {
      const exists = await prisma.user.findUnique({ where: { email: args.email } });
      if (exists) throw new Error("Email already in use");

      const user = await prisma.user.create({
        data: {
          name: args.name,
          email: args.email,
          password: await hashPassword(args.password),
          role: "USER",
        },
      });

      return { token: signToken({ id: user.id, role: user.role }), user };
    },

    // Checks email + password and returns a token
    login: async (_: unknown, args: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email: args.email } });
      if (!user) throw new Error("Invalid credentials");

      const passwordMatch = await comparePassword(args.password, user.password);
      if (!passwordMatch) throw new Error("Invalid credentials");

      return { token: signToken({ id: user.id, role: user.role }), user };
    },
  },
};
