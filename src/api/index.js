import member from "./member";
import interest from "./interest";
import merge from "lodash/merge";
import MailchimpAPI from "./mailchimp";
import md5 from "md5";

const dataSources = () => ({
  mailchimpAPI: new MailchimpAPI()
});

export default {
  typeDefs: [member.typeDefs, interest.typeDefs],
  resolvers: merge({}, member.resolvers, interest.resolvers),
  dataSources,
  context: async () => ({
    helpers: {
      md5
    }
  })
};
