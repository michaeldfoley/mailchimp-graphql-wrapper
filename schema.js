import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from "graphql";
import { fromGlobalId, globalIdField, nodeDefinitions } from "graphql-relay";

const { nodeField, nodeInterface } = nodeDefinitions(
  // A method that maps from a global id to an object
  (globalId, { loaders }) => {
    const { id, type } = fromGlobalId(globalId);
    if (type === "Person") {
      return loaders.person.load(id);
    }
  },
  // A method that maps from an object to a type
  obj => {
    if (obj.hasOwnProperty("id")) {
      return PersonType;
    }
  }
);

const InterestType = new GraphQLObjectType({
  name: "Interest",
  description: "Mailchimp interest group",
  fields: () => ({
    id: {
      type: GraphQLID,
      description: "Interest ID",
      resolve: obj => obj.id
    },
    category_id: {
      type: GraphQLString,
      description: "ID of the container category.",
      resolve: obj => obj.category_id
    },
    name: {
      type: GraphQLString,
      description: "Name of the interest category",
      resolve: obj => obj.name
    },
    count: {
      type: GraphQLString,
      description: "Subscriber count",
      resolve: obj => obj.subscriber_count
    }
  })
});

const PersonType = new GraphQLObjectType({
  name: "Person",
  description: "Email list subscriber",
  fields: () => ({
    id: globalIdField("Person"),
    emailId: {
      type: GraphQLID,
      description:
        "The MD5 hash of the lowercase version of the list member’s email address.",
      resolve: obj => obj.id
    },
    email: {
      type: GraphQLString,
      description: "Preferred Email Address",
      resolve: obj => obj.email_address
    },
    status: {
      type: GraphQLString,
      description:
        "Subscription status (subscribed, unsubscribed, cleaned, pending)",
      resolve: obj => obj.status
    },
    firstName: {
      type: GraphQLString,
      description: "First Name",
      resolve: obj => obj.merge_fields.FNAME
    },
    lastName: {
      type: GraphQLString,
      description: "Last Name",
      resolve: obj => obj.merge_fields.LNAME
    },
    fidn: {
      type: GraphQLString,
      description: "Fordham ID Number",
      resolve: obj => obj.merge_fields.FIDN
    },
    interests: {
      type: new GraphQLList(InterestType),
      description: "Interest categories",
      resolve: (obj, args, { loaders }) =>
        loaders.interest.loadMany(
          Object.keys(obj.interests).filter(key => obj.interests[key])
        )
    }
  }),
  interfaces: [nodeInterface]
});

const QueryType = new GraphQLObjectType({
  name: "Query",
  description: "The root of all... queries",
  fields: () => ({
    allPeople: {
      type: new GraphQLList(PersonType),
      description: "Get all subscribers",
      resolve: (root, args, { loaders }) => loaders.person.loadAll()
    },
    node: nodeField,
    person: {
      type: PersonType,
      description: "Get an individual subscriber",
      args: {
        id: { type: GraphQLID },
        email: { type: GraphQLString }
      },
      resolve: (root, args, { loaders }) => loaders.person.load(args)
    }
  })
});

export default new GraphQLSchema({
  query: QueryType
});
