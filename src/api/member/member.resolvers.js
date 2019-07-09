import keyBy from "lodash/keyBy";
import isEmpty from "lodash/isEmpty";

async function member(
  _,
  { input: { id, email } },
  { dataSources: { mailchimpAPI }, helpers: { md5 } }
) {
  id = getId(id, email, md5);
  const member = await mailchimpAPI.getMember(id);
  if (!member) {
    throw new Error("Member does not exist");
  }
  return member;
}

async function updateMember(
  _,
  { input: { id, email, status, interests } },
  { dataSources: { mailchimpAPI } }
) {
  const payload = {
    status,
    interests: {}
  };

  if (email) {
    payload.email_address = email;
  }

  interests.forEach(
    interest => (payload.interests[interest.id] = interest.subscribed)
  );

  const member = await mailchimpAPI.patchMember(id, payload);
  return member;
}

async function unsubscribeMember(
  _,
  { input: { id, email } },
  { dataSources: { mailchimpAPI } }
) {
  id = getId(id, email, md5);
  const member = await mailchimpAPI.patchMember(id, {
    status: "unsubscribed"
  });
  return member;
}

async function getMemberInterests(
  { interests },
  _,
  { dataSources: { mailchimpAPI } }
) {
  let interestOptions = keyBy(await mailchimpAPI.getAllInterests(), "id");
  return interests.map(key => interestOptions[key]);
}

function getId(id, email, hash) {
  if (!id && !email) {
    throw new Error("Specify id or email");
  }
  if (!id) {
    id = hash(email.toLowerCase());
  }
  return id;
}

export default {
  Query: {
    member
  },
  Mutation: {
    updateMember,
    unsubscribeMember
  },
  Member: {
    interests: getMemberInterests
  }
};
