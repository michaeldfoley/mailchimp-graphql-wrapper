import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { PersonQuery, PeopleQuery } from "./queries/person";
import { InterestQuery } from "./queries/interest";
import { nodeField } from "./nodes";

const Query = new GraphQLObjectType({
  name: "Query",
  description: "The root of all... queries",
  fields: () => ({
    interest: InterestQuery,
    node: nodeField,
    people: PeopleQuery,
    person: PersonQuery
  })
});

export default new GraphQLSchema({
  query: Query
});
