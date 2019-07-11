import { ApolloServer } from "apollo-server";
import { execute, toPromise } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import fetch from "node-fetch";
import md5 from "md5";
import member from "./member";
import interest from "./interest";
import MailchimpAPI from "../api/mailchimp";

/**
 * Integration testing utils
 */
const constructTestServer = () => {
  const mailchimpAPI = new MailchimpAPI("ABC123-us1", "1a23");

  const server = new ApolloServer({
    typeDefs: [member.typeDefs, interest.typeDefs],
    resolvers: [member.resolvers, interest.resolvers],
    dataSources: () => ({
      mailchimpAPI
    }),
    context: async () => ({
      helpers: {
        md5
      }
    })
  });

  return { server, mailchimpAPI };
};

/**
 * e2e Testing Utils
 */
const startTestServer = async server => {
  const httpServer = await server.listen({ port: 0 });

  const link = new HttpLink({
    uri: `http://localhost:${httpServer.port}`,
    fetch
  });

  const executeOperation = ({ query, variables = {} }) =>
    execute(link, { query, variables });

  return {
    link,
    stop: () => httpServer.server.close(),
    graphql: executeOperation
  };
};

export default { toPromise, constructTestServer, startTestServer };
