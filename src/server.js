import { ApolloServer } from "apollo-server";
import gqlServerConfig from "./api";

const server = new ApolloServer(gqlServerConfig);

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
