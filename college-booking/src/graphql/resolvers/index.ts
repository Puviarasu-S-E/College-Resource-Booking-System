import { authResolvers } from "./auth";
import { resourceResolvers } from "./resource";
import { bookingResolvers } from "./booking";

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...resourceResolvers.Query,
    ...bookingResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...resourceResolvers.Mutation,
    ...bookingResolvers.Mutation,
  },
};
