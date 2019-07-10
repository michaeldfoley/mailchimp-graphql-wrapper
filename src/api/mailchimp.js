import PQueue from "p-queue";
import { RESTDataSource } from "apollo-datasource-rest";

const Queue = new PQueue({ concurrency: 10 });

export default class MailchimpAPI extends RESTDataSource {
  constructor(API_KEY, LIST_ID) {
    super();

    if (!/.+\-.+/.test(API_KEY)) {
      throw new Error(`missing or invalid api key: ${API_KEY}`);
    }

    this.API_KEY = API_KEY;
    this.LIST_ID = LIST_ID;
    this.baseURL = `https://${API_KEY.split("-")[1]}.api.mailchimp.com/3.0/`;
  }

  async willSendRequest(request) {
    request.headers.set(
      "User-Agent",
      "mailchimp-graphql : https://github.com/michaeldfoley/mailchimp-graphql"
    );
    request.headers.set(
      "Authorization",
      `Basic ${Buffer.from("any:" + this.API_KEY).toString("base64")}`
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

  interestReducer(interest) {
    const { id, category_id, name, subscriber_count } = interest;
    return {
      id,
      categoryId: category_id,
      name,
      count: subscriber_count
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

  async getMember(id, listId = this.LIST_ID) {
    const member = await this.get(`/lists/${listId}/members/${id}`);
    return this.memberReducer(member);
  }

  async patchMember(id, body, listId = this.LIST_ID) {
    const member = await this.patch(`/lists/${listId}/members/${id}`, body);
    return this.memberReducer(member);
  }

  async getInterest(id, categoryId, listId = this.LIST_ID) {
    const interest = await this.get(
      `lists/${listId}/interest-categories/${categoryId}/interests/${id}`
    );
    return this.interestReducer(interest);
  }

  async getAllInterests() {
    const categories = (await this.getInterestCategories())["categories"];
    const interests = await Promise.all(
      categories.map(
        async category =>
          await this.getInterestsByCategory(category.id, category.list_id)
      )
    );
    return interests.flat();
  }

  async getInterestCategories(limit = 60, listId = this.LIST_ID) {
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

  async getInterestsByCategory(categoryId, limit = 60, listId = this.LIST_ID) {
    const interests = (await this.get(
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
    ))["interests"];
    return interests.map(interest => this.interestReducer(interest));
  }
}
