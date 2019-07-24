import to from "../../utils/to";

async function member(
  _,
  { input: { id, email } },
  { dataSources: { mailchimpAPI }, helpers: { md5 } }
) {
  id = getId(id, email, md5);
  const [err, member] = await to(mailchimpAPI.getMemberById(id));
  if (!member) {
    throw new Error("Member does not exist");
  }
  return member;
}

async function updateMember(
  _,
  { input: { id, ...input } },
  { dataSources: { mailchimpAPI } }
) {
  const [err, member] = await to(mailchimpAPI.patchMember(id, input));
  return member;
}

async function unsubscribeMember(
  _,
  { input: { id, email } },
  { dataSources: { mailchimpAPI }, helpers: { md5 } }
) {
  id = getId(id, email, md5);
  const [err, member] = await to(mailchimpAPI.unsubscribeMember(id));
  return member;
}

async function getMemberInterests(
  { interests },
  _,
  { dataSources: { mailchimpAPI } }
) {
  return interests.map(id => mailchimpAPI.getInterestById(id));
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

// export getId function for testing
export const ___GET_ID = getId;

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
