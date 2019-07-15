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

  const [err, member] = await to(mailchimpAPI.patchMember(id, payload));
  return member;
}

async function unsubscribeMember(
  _,
  { input: { id, email } },
  { dataSources: { mailchimpAPI }, helpers: { md5 } }
) {
  id = getId(id, email, md5);
  const [err, member] = await to(
    mailchimpAPI.patchMember(id, {
      status: "unsubscribed"
    })
  );
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
