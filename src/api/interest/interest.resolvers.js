async function interest(
  _,
  { input: { id, categoryId } },
  { dataSources: { mailchimpAPI } }
) {
  const interest = await mailchimpAPI.getInterest(id, categoryId);
  return interest;
}

async function interests(_, __, { dataSources: { mailchimpAPI } }) {
  const interests = mailchimpAPI.getAllInterests();
  return interests;
}

export default {
  Query: {
    interest,
    interests
  }
};
