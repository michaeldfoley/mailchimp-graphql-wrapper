import { fromGlobalId, mutationWithClientMutationId } from "graphql-relay";
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from "graphql";
import { PersonStatusEnumType, GraphQLPerson } from "../nodes";
import { updatePerson } from "../../person";

const InterestUpdateInputType = new GraphQLInputObjectType({
  name: "InterestUpdate",
  description: "Update interest field",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    subscribed: { type: new GraphQLNonNull(GraphQLBoolean) }
  })
});

const UpdatePersonMutation = mutationWithClientMutationId({
  name: "UpdatePerson",
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: GraphQLString },
    status: { type: PersonStatusEnumType },
    interests: { type: new GraphQLList(InterestUpdateInputType) }
  },
  outputFields: {
    person: {
      type: new GraphQLNonNull(GraphQLPerson),
      resolve: ({ res }) => res
    }
  },
  mutateAndGetPayload: ({ id, interests, ...args }) => {
    const personId = fromGlobalId(id).id;
    const personInterests = {};
    interests &&
      interests.forEach(
        interest =>
          (personInterests[fromGlobalId(interest.id).id] = interest.subscribed)
      );
    let res = updatePerson(personId, { ...args, interests: personInterests });
    return { id, res };
  }
});

export default UpdatePersonMutation;
