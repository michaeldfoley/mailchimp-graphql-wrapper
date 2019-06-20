import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { PersonQuery, PeopleQuery } from "./queries/person";
import { InterestQuery } from "./queries/interest";
import { nodeField } from "./nodes";
import UpdatePersonMutation from "./mutations/updatePerson";
import UnsubscribePersonMutation from "./mutations/unsubscribePerson";

const Query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    interest: InterestQuery,
    node: nodeField,
    people: PeopleQuery,
    person: PersonQuery
  })
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    updatePerson: UpdatePersonMutation,
    unsubscribe: UnsubscribePersonMutation
  })
});

export default new GraphQLSchema({
  query: Query,
  mutation: Mutation
});
