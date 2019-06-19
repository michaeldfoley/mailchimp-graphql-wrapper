import express from "express";
import graphqlHTTP from "express-graphql";
import personLoader from "./data/person";
import interestLoader from "./data/interest";
import schema from "./data/schema";

const app = express();

app.use(
  graphqlHTTP(req => {
    const loaders = { person: personLoader, interest: interestLoader };
    return {
      context: { loaders },
      graphiql: true,
      schema
    };
  })
);

app.listen(5000, () =>
  console.log("GraphQL Server running at http://localhost:5000")
);
