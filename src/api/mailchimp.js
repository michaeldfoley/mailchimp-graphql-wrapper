import PQueue from "p-queue";
import dotenv from "dotenv";
import { RESTDataSource } from "apollo-datasource-rest";
dotenv.config();

const API_KEY = process.env.API_KEY;
const LIST_ID = process.env.LIST_ID;
const Queue = new PQueue({ concurrency: 10 });

export default class MailchimpAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = `https://${API_KEY.split("-")[1]}.api.mailchimp.com/3.0/`;

    if (!/.+\-.+/.test(API_KEY)) {
      throw new Error(`missing or invalid api key: ${API_KEY}`);
    }
  }

  async willSendRequest(request) {
    request.headers.set(
      "User-Agent",
      "mailchimp-graphql : https://github.com/michaeldfoley/mailchimp-graphql"
    );
    request.headers.set(
      "Authorization",
      `Basic ${Buffer.from("any:" + API_KEY).toString("base64")}`
    );
    if (!request.params.has("fields")) {
      request.params.set("exclude_fields", "_links");
    }
  }

  fieldToArray(field) {
    return field.split(",").map(str => str.replace(/^\^|\^$/g, ""));
  }

  memberReducer(member) {
    const {
      id,
      email_address: email,
      status,
      interests,
      merge_fields: { FNAME, LNAME, FIDN, ROLE, EXCLUSION, IMCID }
    } = member;
    return {
      id,
      email,
      status,
      firstName: FNAME,
      lastName: LNAME,
      fidn: FIDN,
      roles: this.fieldToArray(ROLE),
      interests: Object.keys(interests).filter(key => interests[key]),
      exclusions: this.fieldToArray(EXCLUSION),
      recipientId: IMCID
    };
  }

  async queuedFetch(method, path, body, init) {
    return await Queue.add(() => super[method](path, body, init));
  }

  async get(path, params, init) {
    return this.queuedFetch("get", path, params, init);
  }

  async post(path, body, init) {
    return this.queuedFetch("post", path, body, init);
  }

  async patch(path, body, init) {
    return this.queuedFetch("patch", path, body, init);
  }

  async put(path, body, init) {
    return this.queuedFetch("put", path, body, init);
  }

  async delete(path, params, init) {
    return this.queuedFetch("delete", path, params, init);
  }

  async getMember(id, listId = LIST_ID) {
    const member = await this.get(`/lists/${listId}/members/${id}`);
    return this.memberReducer(member);
  }

  async patchMember(id, body, listId = LIST_ID) {
    const member = await this.patch(`/lists/${listId}/members/${id}`, body);
    return this.memberReducer(member);
  }

  async getInterest(id, categoryId, listId = LIST_ID) {
    return this.get(
      `lists/${listId}/interest-categories/${categoryId}/interests/${id}`
    );
  }

  async getAllInterests() {
    const categories = (await this.getInterestCategories())["categories"];
    const interests = await Promise.all(
      categories.map(
        async category =>
          (await this.getInterestsByCategory(category.id, category.list_id))[
            "interests"
          ]
      )
    );
    return interests.flat();
  }

  async getInterestCategories(limit = 60, listId = LIST_ID) {
    return this.get(
      `lists/${listId}/interest-categories`,
      {
        fields: ["categories.id", "categories.list_id"],
        count: limit
      },
      {
        cacheOptions: { ttl: 3600 }
      }
    );
  }

  async getInterestsByCategory(categoryId, limit = 60, listId = LIST_ID) {
    return this.get(
      `lists/${listId}/interest-categories/${categoryId}/interests`,
      {
        fields: [
          "interests.id",
          "interests.category_id",
          "interests.list_id",
          "interests.name",
          "interests.subscriber_count"
        ],
        count: limit
      },
      {
        cacheOptions: { ttl: 3600 }
      }
    );
  }
}
