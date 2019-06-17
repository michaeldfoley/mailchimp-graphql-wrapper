import DataLoader from "dataloader";

import express from "express";
import graphqlHTTP from "express-graphql";
import Mailchimp from "mailchimp-api-v3";
import dotenv from "dotenv";
import md5 from "md5";
import schema from "./schema";

dotenv.config();
const mailchimp = new Mailchimp(process.env.API_KEY);

async function getByURL(relativeURL, { property, ...query } = {}) {
  let res = await mailchimp.get(relativeURL, query);
  return property ? res[property] : res;
}

function getListByURL(relativeURL, args = {}) {
  return getByURL(`/lists/${process.env.LIST_ID}/${relativeURL}`, args);
}

function getPeople() {
  return getListByURL("members/", { property: "members" });
}

function getPerson({ id, email }) {
  if (!id) {
    id = md5(email.toLowerCase());
  }
  return getListByURL(`members/${id}/`);
}

const getInterests = new DataLoader(keys =>
  Promise.all(
    keys.map(async () => {
      let categories = await getInterestCategories.load("__all__");
      let interestList = await Promise.all(
        categories.map(getInterestsByCategory)
      );
      return interestList.flat();
    })
  )
);

const getInterestCategories = new DataLoader(keys =>
  Promise.all(
    keys.map(() =>
      getListByURL("interest-categories/", {
        property: "categories",
        count: 60
      })
    )
  )
);

function getInterestsByCategory(category) {
  return getListByURL(`interest-categories/${category.id}/interests/`, {
    property: "interests",
    count: 60
  });
}

async function getInterest(id) {
  let interests = await getInterests.load("__all__");
  return interests.find(interest => interest.id === id);
}

const app = express();

app.use(
  graphqlHTTP(req => {
    const cacheMap = new Map();
    const peopleLoader = new DataLoader(
      keys => Promise.all(keys.map(getPeople)),
      { cacheMap }
    );
    const personLoader = new DataLoader(
      keys => Promise.all(keys.map(getPerson)),
      {
        cacheKeyFn: args =>
          `/lists/${process.env.LIST_ID}/members/${args.id || args.email}/`,
        cacheMap
      }
    );
    const personByURLLoader = new DataLoader(
      keys => Promise.all(keys.map(getByURL)),
      { cacheMap }
    );
    const interestLoader = new DataLoader(
      keys => Promise.all(keys.map(getInterest)),
      {
        cacheKeyFn: id =>
          `/lists/${
            process.env.LIST_ID
          }/interest-categories/.../interests/${id}/`,
        cacheMap
      }
    );
    personLoader.loadAll = peopleLoader.load.bind(peopleLoader, "__all__");
    personLoader.loadByURL = personByURLLoader.load.bind(personByURLLoader);
    personLoader.loadManyByURL = personByURLLoader.loadMany.bind(
      personByURLLoader
    );
    interestLoader.loadMany = interestLoader.loadMany.bind(interestLoader);
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
