import member from "./member";
import interest from "./interest";
import MailchimpAPI from "./mailchimp";
import md5 from "md5";
import dotenv from "dotenv";
dotenv.config();

const { API_KEY, LIST_ID } = process.env;

const dataSources = () => ({
  mailchimpAPI: new MailchimpAPI(API_KEY, LIST_ID)
});

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
