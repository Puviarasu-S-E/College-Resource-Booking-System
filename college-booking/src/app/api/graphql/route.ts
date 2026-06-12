import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/graphql/schema/typeDefs";
import { resolvers } from "@/graphql/resolvers";
import { createContext, GraphQLContext } from "@/graphql/context";
import { NextRequest, NextResponse } from "next/server";

const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

const apolloHandler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async (req) => createContext(req),
});

async function handler(req: NextRequest): Promise<NextResponse> {
  return apolloHandler(req) as Promise<NextResponse>;
}

export { handler as GET, handler as POST };
