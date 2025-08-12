import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: Int!
    auth0Id: String
    name: String
    email: String
    picture: String
    createdAt: DateTime!
  }

  type Shift {
    id: Int!
    user: User!
    clockIn: DateTime
    clockOut: DateTime
    clockInLat: Float
    clockInLng: Float
    clockOutLat: Float
    clockOutLng: Float
    note: String
    createdAt: DateTime!
  }

  type Query {
    shifts: [Shift!]!
    shift(id: Int!): Shift
    users: [User!]!
  }

  input CreateShiftInput {
    userId: Int!
    clockIn: DateTime
    clockOut: DateTime
    clockInLat: Float
    clockInLng: Float
    clockOutLat: Float
    clockOutLng: Float
    note: String
  }

  type Mutation {
    createShift(data: CreateShiftInput!): Shift!
  }
`;