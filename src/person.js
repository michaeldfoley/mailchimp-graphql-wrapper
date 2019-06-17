import DataLoader from "dataloader";
import md5 from "md5";
import { getList } from "./mailchimp";

const cacheMap = new Map();

const personLoader = new DataLoader(keys => Promise.all(keys.map(getPerson)), {
  cacheKeyFn: args =>
    `/lists/${process.env.LIST_ID}/members/${args.id || args.email}/`,
  cacheMap
});

const peopleLoader = new DataLoader(keys => Promise.all(keys.map(getPeople)), {
  cacheMap
});

personLoader.loadAll = peopleLoader.load.bind(peopleLoader, "__all__");

function getPeople() {
  return getList("members/", { key: "members" });
}

function getPerson({ id, email }) {
  if (!id) {
    id = md5(email.toLowerCase());
  }
  return getList(`members/${id}/`);
}

export default personLoader;
