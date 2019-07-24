import PQueue from "p-queue";
import keyBy from "lodash/keyBy";
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
    return field
      .split(",")
      .map(str => str.replace(/^\^|\^$/g, ""))
      .filter(Boolean);
  }

  memberReducer(member) {
    const {
      id,
      email_address: email,
      email_type: emailType,
      status,
      interests,
      merge_fields: { FNAME, LNAME, FIDN, ROLE, EXCLUSION, IMCID }
    } = member;
    return {
      id,
      email,
      emailType,
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
    return Queue.add(() => super[method](path, body, init));
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

  async getMemberById(id, listId = this.LIST_ID) {
    const member = await this.get(`lists/${listId}/members/${id}`, {
      fields: [
        "id",
        "email_address",
        "email_type",
        "status",
        "merge_fields",
        "interests"
      ]
    });
    return this.memberReducer(member);
  }

  async patchMember(id, body, listId = this.LIST_ID) {
    const { email, interests, ...payload } = body;

    if (email) {
      payload.email_address = email;
    }
    if (interests) {
      payload.interests = {};
      interests.forEach(
        interest => (payload.interests[interest.id] = interest.subscribed)
      );
    }

    const member = await this.patch(`lists/${listId}/members/${id}`, payload);
    return this.memberReducer(member);
  }

  async unsubscribeMember(id, listId = this.LIST_ID) {
    return await this.patchMember(id, { status: "unsubscribed" }, listId);
  }

  async getInterestById(id, listId = this.LIST_ID) {
    const allInterests = await this.getAllInterestsObject(listId);
    return allInterests[id];
  }

  async getAllInterests(listId = this.LIST_ID) {
    return Object.values(await this.getAllInterestsObject(listId));
  }

  async getAllInterestsObject(listId = this.LIST_ID) {
    if (!this.allInterests) {
      const categories = await this.getInterestCategories(60, listId);
      const interests = await Promise.all(
        categories.map(async category => {
          return await this.getInterestsByCategory(
            category.id,
            60,
            category.list_id
          );
        })
      );
      this.allInterests = keyBy(interests.flat(), "id");
    }
    return this.allInterests;
  }

  async getInterestCategories(limit = 60, listId = this.LIST_ID) {
    const categories = (await this.get(
      `lists/${listId}/interest-categories`,
      {
        fields: ["categories.id"],
        count: limit
      },
      {
        cacheOptions: { ttl: 3600 }
      }
    ))["categories"];
    return categories;
  }

  async getInterestsByCategory(categoryId, limit = 60, listId = this.LIST_ID) {
    const interests = (await this.get(
      `lists/${listId}/interest-categories/${categoryId}/interests`,
      {
        fields: [
          "interests.id",
          "interests.category_id",
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
