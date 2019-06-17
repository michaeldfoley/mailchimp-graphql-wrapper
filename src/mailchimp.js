import Mailchimp from "mailchimp-api-v3";
import dotenv from "dotenv";
import PQueue from "p-queue";

dotenv.config();
const mailchimp = new Mailchimp(process.env.API_KEY);
const queue = new PQueue({ concurrency: 10 });

async function get(path, { key, ...query }) {
  let res = await queue.add(() => mailchimp.get(path, query));
  return key ? res[key] : res;
}

export default { get };
