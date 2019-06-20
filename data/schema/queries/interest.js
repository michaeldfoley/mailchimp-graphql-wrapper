import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLString
} from "graphql";
import { MatchEnumType } from "./helpers";
import { GraphQLInterest } from "../nodes";

export const InterestsInputType = new GraphQLInputObjectType({
  name: "Interests",
  description: "Return records that match interest(s)",
  fields: () => ({
    categoryId: {
      type: new GraphQLNonNull(GraphQLID),
      description: "Interest Category ID"
    },
    ids: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: "List of interest ids for the category"
    },
    match: {
      type: new GraphQLNonNull(MatchEnumType)
    }
  })
});

export const InterestQuery = {
  type: GraphQLInterest,
  description: "Get interest information",
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    categoryId: { type: GraphQLString }
  },
  resolve: (root, args, { loaders }) => loaders.interest.load(args)
};
