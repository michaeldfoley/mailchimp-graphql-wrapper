import interestResolver from "./interest.resolvers";
import gqlLoader from "../../utils/gqlLoader";

export default {
  resolvers: interestResolver,
  typeDefs: gqlLoader("interest/interest.graphql")
};
