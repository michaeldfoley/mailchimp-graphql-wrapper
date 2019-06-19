import Mailchimp from "mailchimp-api-v3";
import PQueue from "p-queue";
import dotenv from "dotenv";
dotenv.config();

const mailchimp = new Mailchimp(process.env.API_KEY);
const queue = new PQueue({ concurrency: 10 });

export async function get(path, { key, ...query }) {
  let res = await queue.add(() => mailchimp.get(path, query));
  return key ? res[key] : res;
}

export function getList(path, args = {}) {
  return get(`/lists/${process.env.LIST_ID}/${path}`, args);
}
