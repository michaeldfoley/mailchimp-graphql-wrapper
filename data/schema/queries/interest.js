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
    category_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "Interest Category ID"
    },
    ids: {
      type: new GraphQLNonNull(GraphQLList(new GraphQLNonNull(GraphQLID))),
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
    category_id: { type: GraphQLString }
  },
  resolve: (root, args, { loaders }) => loaders.interest.load(args)
};
