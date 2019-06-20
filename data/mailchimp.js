import Mailchimp from "mailchimp-api-v3";
import PQueue from "p-queue";
import dotenv from "dotenv";
dotenv.config();

const mailchimp = new Mailchimp(process.env.API_KEY);
const queue = new PQueue({ concurrency: 10 });

async function request(path, { key, ...args }, method = "get") {
  let res = await queue.add(() => mailchimp[method](path, args));
  return key ? res[key] : res;
}

export function get(path, query) {
  return request(path, query, "get");
}

export function patch(path, body) {
  return request(path, body, "patch");
}

export function getList(path, args = {}) {
  return get(`/lists/${process.env.LIST_ID}/${path}`, args);
}

export function patchList(path, args = {}) {
  return patch(`/lists/${process.env.LIST_ID}/${path}`, args);
}
