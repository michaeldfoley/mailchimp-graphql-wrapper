import DataLoader from "dataloader";
import express from "express";
import graphqlHTTP from "express-graphql";
import mailchimp from "./src/mailchimp";
import md5 from "md5";
import schema from "./schema";

function getListByURL(path, args = {}) {
  return mailchimp.get(`/lists/${process.env.LIST_ID}/${path}`, args);
}

function getPeople() {
  return getListByURL("members/", { key: "members" });
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
        key: "categories",
        count: 60
      })
    )
  )
);

function getInterestsByCategory(category) {
  return getListByURL(`interest-categories/${category.id}/interests/`, {
    key: "interests",
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
