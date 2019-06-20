import DataLoader from "dataloader";
import md5 from "md5";
import { getList, patchList } from "./mailchimp";
import { reject } from "./helpers";

const cacheMap = new Map();

const personLoader = new DataLoader(keys => Promise.all(keys.map(getPerson)), {
  cacheKeyFn: ({ id, email }) => {
    if (!id && email) {
      id = md5(email.toLowerCase());
    }
    return `/lists/${process.env.LIST_ID}/members/${id}/`;
  },
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

export function updatePerson(id, args) {
  personLoader.clear({ id });
  return patchList(`/members/${id}/`, args);
}

export function unsubscribePerson(id) {
  personLoader.clear({ id });
  return patchList(`/members/${id}/`, { status: "unsubscribed" });
}

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
