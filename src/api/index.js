import md5 from "md5";
import member from "./member";
import interest from "./interest";
import dataSources from "./datasources";

export default {
  typeDefs: [member.typeDefs, interest.typeDefs],
  resolvers: [member.resolvers, interest.resolvers],
  dataSources,
  context: async () => ({
    helpers: {
      md5
    }
  })
};
