import {
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLEnumType,
  GraphQLInt
} from "graphql";
import { InterestsInputType } from "./interest";
import { SortQueryType } from "./helpers";
import { GraphQLPerson, PersonStatusEnumType } from "../nodes";

const SortPeopleEnumType = new GraphQLEnumType({
  name: "SortEnum",
  description: "Sort return values by this field",
  values: { timestamp_opt: {}, timestamp_signup: {}, last_changed: {} }
});

export const PeopleQuery = {
  type: new GraphQLList(GraphQLPerson),
  description: "Get all subscribers",
  args: {
    count: { type: GraphQLInt, defaultValue: 10 },
    status: { type: PersonStatusEnumType },
    interests: { type: InterestsInputType },
    sort: { type: SortQueryType(SortPeopleEnumType) }
  },
  resolve: (root, { interests, sort, ...args }, { loaders }) => {
    if (typeof interests == "object") {
      args.interest_category_id = interests.categoryId;
      args.interest_ids = interests.ids.join(",");
      args.interest_match = interests.match;
    }
    if (typeof sort == "object") {
      args.sort_field = sort.field;
      args.sort_dir = sort.dir;
    }
    return loaders.person.loadAll(args);
  }
};

export const PersonQuery = {
  type: GraphQLPerson,
  description: "Get an individual subscriber",
  args: {
    id: { type: GraphQLID },
    email: { type: GraphQLString }
  },
  resolve: (root, args, { loaders }) => loaders.person.load(args)
};
