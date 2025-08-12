import { GraphQLScalarType, Kind } from 'graphql';
import prisma from '@/src/config/prisma';

// DateTime scalar (ISO 8601)
const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 DateTime scalar',
  parseValue(value: any) {
    return value ? new Date(value) : null;
  },
  serialize(value: any) {
    if (!value) return null;
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// helper: ensure there's a DB user for the logged-in Auth0 profile
async function getOrCreateDbUserFromContext(context: any) {
  const auth0User = context?.user;
  if (!auth0User) return null;
  const auth0Id = auth0User.sub;
  if (!auth0Id) return null;

  // upsert: find by auth0Id or create
  const dbUser = await prisma.user.upsert({
    where: { auth0Id },
    update: {
      name: auth0User.name ?? undefined,
      email: auth0User.email ?? undefined,
      picture: auth0User.picture ?? undefined,
    },
    create: {
      auth0Id,
      name: auth0User.name ?? undefined,
      email: auth0User.email ?? undefined,
      picture: auth0User.picture ?? undefined,
    },
  });
  return dbUser;
}

export const resolvers = {
  DateTime,

  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      // If no authenticated user, return null
      if (!context?.user) return null;
      const dbUser = await getOrCreateDbUserFromContext(context);
      // include recent shifts if you want
      return prisma.user.findUnique({ where: { id: dbUser.id }, include: { shifts: true } });
    },

    shifts: async () => {
      return prisma.shift.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
    },

    shift: async (_: any, args: { id: number }) => {
      return prisma.shift.findUnique({ where: { id: args.id }, include: { user: true } });
    },

    users: async () => {
      return prisma.user.findMany({ orderBy: { name: 'asc' } });
    },
  },

  Mutation: {
    createShift: async (_: any, args: { data: any }, context: any) => {
      const d = args.data ?? {};

      // Resolve user: prefer passed userId, otherwise use authenticated user
      let userId = d.userId ?? null;
      if (!userId) {
        const dbUser = await getOrCreateDbUserFromContext(context);
        if (!dbUser) throw new Error('No authenticated user and no userId provided');
        userId = dbUser.id;
      }

      userId = Number(userId);
      if (Number.isNaN(userId)) throw new Error('Invalid userId');

      // Validate user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error(`User with id=${userId} not found`);

      const created = await prisma.shift.create({
        data: {
          userId,
          clockIn: d.clockIn ? new Date(d.clockIn) : null,
          clockOut: d.clockOut ? new Date(d.clockOut) : null,
          clockInLat: d.clockInLat ?? null,
          clockInLng: d.clockInLng ?? null,
          clockOutLat: d.clockOutLat ?? null,
          clockOutLng: d.clockOutLng ?? null,
          note: d.note ?? null,
        },
        include: { user: true },
      });

      return created;
    },

    // For a careworker to clock in at current time and coordinates
    clockIn: async (_: any, args: { data: any }, context: any) => {
      if (!context?.user) throw new Error('Not authenticated');
      const dbUser = await getOrCreateDbUserFromContext(context);
      const { clockInLat, clockInLng, note } = args.data ?? {};

      const created = await prisma.shift.create({
        data: {
          userId: dbUser.id,
          clockIn: new Date(),
          clockInLat: clockInLat ?? null,
          clockInLng: clockInLng ?? null,
          note: note ?? null,
        },
        include: { user: true },
      });

      return created;
    },

    // For a careworker to clock out of their most recent open shift
    clockOut: async (_: any, args: { data: any }, context: any) => {
      if (!context?.user) throw new Error('Not authenticated');
      const dbUser = await getOrCreateDbUserFromContext(context);
      const { clockOutLat, clockOutLng, note } = args.data ?? {};

      // find latest open shift for user
      const openShift = await prisma.shift.findFirst({ where: { userId: dbUser.id, clockOut: null }, orderBy: { createdAt: 'desc' } });
      if (!openShift) throw new Error('No open shift found for this user');

      const updated = await prisma.shift.update({
        where: { id: openShift.id },
        data: {
          clockOut: new Date(),
          clockOutLat: clockOutLat ?? null,
          clockOutLng: clockOutLng ?? null,
          note: note ? `${openShift.note ?? ''}\n${note}` : openShift.note,
        },
        include: { user: true },
      });

      return updated;
    },
  },
};