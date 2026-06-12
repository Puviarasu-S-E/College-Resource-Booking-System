import { prisma } from "@/lib/prisma";
import { GraphQLContext } from "@/graphql/context";

export const resourceResolvers = {
  Query: {
    // Returns all resources
    resources: () => prisma.resource.findMany(),

    // Returns one resource by id
    resource: (_: unknown, args: { id: string }) => {
      return prisma.resource.findUnique({ where: { id: Number(args.id) } });
    },
  },

  Mutation: {
    // Admin only: add a new resource
    addResource: async (_: unknown, args: { name: string; category: string; description: string }, ctx: GraphQLContext) => {
      if (ctx.user?.role !== "ADMIN") throw new Error("Unauthorized");
      return prisma.resource.create({ data: args });
    },

    // Admin only: update an existing resource
    updateResource: async (_: unknown, args: { id: string; name?: string; category?: string; description?: string }, ctx: GraphQLContext) => {
      if (ctx.user?.role !== "ADMIN") throw new Error("Unauthorized");
      const { id, ...data } = args;
      return prisma.resource.update({ where: { id: Number(id) }, data });
    },

    // Admin only: delete a resource
    deleteResource: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      if (ctx.user?.role !== "ADMIN") throw new Error("Unauthorized");
      await prisma.resource.delete({ where: { id: Number(args.id) } });
      return true;
    },
  },
};
