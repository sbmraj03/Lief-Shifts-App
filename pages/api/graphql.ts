// pages/api/graphql.ts
import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from '@/src/graphql/typeDefs';
import { resolvers } from '@/src/graphql/resolvers';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, res }: { req: NextApiRequest; res: NextApiResponse }) => {
    // get Auth0 session if present
    const session = await getSession(req, res);
    const user = session?.user || null;
    return { user };
  },
});

const startServer = apolloServer.start();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  await startServer;
  const handler = apolloServer.createHandler({ path: '/api/graphql' });
  return handler(req as any, res as any);
}

export const config = { api: { bodyParser: false } };
