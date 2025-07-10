import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";

// 1. Create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 2. Create handler function that accepts (request, context)
const handler = startServerAndCreateNextHandler(server);

export async function GET(request: Request) {
  return handler(request); // `context` not needed by Apollo, but accepted by Next
}

export async function POST(request: Request) {
  return handler(request);
}
