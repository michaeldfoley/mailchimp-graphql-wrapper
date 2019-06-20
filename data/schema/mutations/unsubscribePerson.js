import { fromGlobalId, mutationWithClientMutationId } from "graphql-relay";
import { GraphQLID, GraphQLNonNull } from "graphql";
import { GraphQLPerson } from "../nodes";
import { unsubscribePerson } from "../../person";

const UnsubscribePersonMutation = mutationWithClientMutationId({
  name: "UnsubscribePerson",
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) }
  },
  outputFields: {
    person: {
      type: new GraphQLNonNull(GraphQLPerson),
      resolve: ({ res }) => res
    }
  },
  mutateAndGetPayload: ({ id }) => {
    const personId = fromGlobalId(id).id;
    let res = unsubscribePerson(personId);
    return { res };
  }
});

export default UnsubscribePersonMutation;
