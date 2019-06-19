import DataLoader from "dataloader";
import md5 from "md5";
import { getList } from "./mailchimp";
import { reject } from "./helpers";

const cacheMap = new Map();

const personLoader = new DataLoader(keys => Promise.all(keys.map(getPerson)), {
  cacheKeyFn: args =>
    `/lists/${process.env.LIST_ID}/members/${args.id || args.email}/`,
  cacheMap
});

const peopleLoader = new DataLoader(keys => Promise.all(keys.map(getPeople)), {
  cacheKeyFn: args => {
    let argsSorted = {};
    Object.keys(args)
      .sort()
      .forEach(key => (argsSorted[key] = args[key]));
    return `/lists/${process.env.LIST_ID}/members/${JSON.stringify(
      argsSorted
    )}`;
  },
  cacheMap
});

personLoader.loadAll = peopleLoader.load.bind(peopleLoader);

function getPeople(args) {
  return getList("members/", {
    key: "members",
    ...args
  });
}

function getPerson({ id, email } = {}) {
  if (!id && !email) {
    return reject("Specify id or email");
  }
  if (!id) {
    id = md5(email.toLowerCase());
  }
  return getList(`members/${id}/`);
}

export default personLoader;
