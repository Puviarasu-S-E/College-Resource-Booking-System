export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Resource {
    id: ID!
    name: String!
    category: String!
    description: String!
  }

  type BookedSlot {
    startTime: String!
    endTime: String!
  }

  type Booking {
    id: ID!
    resourceId: Int!
    date: String!
    startTime: String!
    endTime: String!
    status: String!
    rejectionReason: String
    user: User!
    resource: Resource!
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type Query {
    resources: [Resource!]!
    resource(id: ID!): Resource
    myBookings: [Booking!]!
    allBookings: [Booking!]!
    bookedSlots(resourceId: ID!, date: String!): [BookedSlot!]!
    me: User
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthResponse!
    login(email: String!, password: String!): AuthResponse!

    addResource(name: String!, category: String!, description: String!): Resource!
    updateResource(id: ID!, name: String, category: String, description: String): Resource!
    deleteResource(id: ID!): Boolean!

    createBooking(resourceId: ID!, date: String!, startTime: String!, endTime: String!): Booking!
    cancelBooking(bookingId: ID!): Booking!
    approveBooking(bookingId: ID!): Booking!
    rejectBooking(bookingId: ID!, reason: String!): Booking!
  }
`;
