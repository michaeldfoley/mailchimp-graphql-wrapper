import {
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLEnumType
} from "graphql";

export const DirEnumType = new GraphQLEnumType({
  name: "DirectionEnum",
  description: "Direction to sort",
  values: { ASC: {}, DESC: {} }
});

export const MatchEnumType = new GraphQLEnumType({
  name: "MatchEnum",
  description: "Type of match to perform",
  values: {
    any: {},
    all: {},
    none: {}
  }
});

export function SortQueryType(fieldEnum) {
  return new GraphQLInputObjectType({
    name: "Sort",
    description:
      "Sort results by timestamp_opt, timestamp_signup, or last_changed",
    fields: () => ({
      field: { type: new GraphQLNonNull(fieldEnum) },
      dir: { type: DirEnumType }
    })
  });
}
