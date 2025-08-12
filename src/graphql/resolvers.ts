// src/graphql/resolvers.ts
import { GraphQLScalarType, Kind } from 'graphql';
import prisma from '@/src/config/prisma';

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 DateTime scalar',
  parseValue(value: any) {
    // value from the client (variables)
    return value ? new Date(value) : null;
  },
  serialize(value: any) {
    // value sent to the client
    if (!value) return null;
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  DateTime,

  Query: {
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
      // Optional auth guard
      // if (!context.user) throw new Error('Not authenticated');

      const d = args.data ?? {};
      // basic validation
      if (d.userId === undefined || d.userId === null) {
        throw new Error('userId is required in CreateShiftInput');
      }

      // ensure numeric userId
      const userId = Number(d.userId);
      if (Number.isNaN(userId)) throw new Error('userId must be an integer');

      // ensure user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error(`User with id=${userId} not found`);

      // parse dates safely
      const clockIn = d.clockIn ? new Date(d.clockIn) : null;
      const clockOut = d.clockOut ? new Date(d.clockOut) : null;

      const created = await prisma.shift.create({
        data: {
          userId,
          clockIn,
          clockOut,
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
  },
};
