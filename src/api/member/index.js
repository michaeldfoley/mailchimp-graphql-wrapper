import memberResolver from "./member.resolvers";
import gqlLoader from "../../utils/gqlLoader";

export default {
  resolvers: memberResolver,
  typeDefs: gqlLoader("member/member.graphql")
};
