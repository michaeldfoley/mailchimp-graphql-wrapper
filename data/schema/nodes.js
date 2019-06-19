import {
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from "graphql";
import { fromGlobalId, globalIdField, nodeDefinitions } from "graphql-relay";

const { nodeField, nodeInterface } = nodeDefinitions(
  // A method that maps from a global id to an object
  (globalId, { loaders }) => {
    const { id, type } = fromGlobalId(globalId);
    if (type === "Person") {
      return loaders.person.load({ id });
    }
    if (type === "Interest") {
      return loaders.interest.load({ id });
    }
    return null;
  },
  // A method that maps from an object to a type
  obj => {
    if (obj) {
      return GraphQLPerson;
    }
    if (obj.hasOwnProperty("category_id")) {
      return GraphQLInterest;
    }
    return null;
  }
);

const GraphQLInterest = new GraphQLObjectType({
  name: "Interest",
  description: "Interest group",
  fields: () => ({
    id: globalIdField("Interest"),
    categoryId: {
      type: GraphQLString,
      description: "ID of the container category.",
      resolve: obj => obj.category_id
    },
    name: {
      type: GraphQLString,
      description: "Name of the interest category"
    },
    count: {
      type: GraphQLString,
      description: "Subscriber count",
      resolve: obj => obj.subscriber_count
    }
  }),
  interfaces: [nodeInterface]
});

function mergeField(id, description) {
  return {
    type: GraphQLString,
    description,
    resolve: obj => obj.merge_fields[id]
  };
}

const PersonStatusEnumType = new GraphQLEnumType({
  name: "StatusEnum",
  description: "Subscriber status",
  values: {
    subscribed: {},
    unsubscribed: {},
    cleaned: {},
    pending: {},
    transactional: {}
  }
});

const GraphQLPerson = new GraphQLObjectType({
  name: "Person",
  description: "Email list subscriber",
  fields: () => ({
    id: globalIdField("Person"),
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Preferred Email Address",
      resolve: obj => obj.email_address
    },
    status: {
      type: new GraphQLNonNull(PersonStatusEnumType),
      description: "Subscription status"
    },
    firstName: mergeField("FNAME", "First Name"),
    lastName: mergeField("LNAME", "Last Name"),
    fidn: mergeField("FIDN", "Fordham ID Number"),
    role: mergeField("ROLE", "Role"),
    exclusion: mergeField("EXCLUSION", "Exclusion Codes"),
    recipientId: mergeField("IMCID", "Recipient ID"),
    interests: {
      type: new GraphQLList(GraphQLInterest),
      description: "Interest categories",
      resolve: (obj, args, { loaders }) =>
        loaders.interest.loadMany(
          Object.keys(obj.interests)
            .filter(key => obj.interests[key])
            .map(key => ({ id: key }))
        )
    }
  }),
  interfaces: [nodeInterface]
});

export {
  GraphQLInterest,
  GraphQLPerson,
  PersonStatusEnumType,
  nodeField,
  nodeInterface
};
