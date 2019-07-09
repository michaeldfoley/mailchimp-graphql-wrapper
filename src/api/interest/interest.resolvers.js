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
  },
  Interest: {
    categoryId: ({ category_id }) => category_id,
    count: ({ subscriber_count }) => subscriber_count
  }
};
