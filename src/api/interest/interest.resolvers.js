import to from "../../utils/to";

async function interest(
  _,
  { input: { id, categoryId } },
  { dataSources: { mailchimpAPI } }
) {
  const [err, interest] = await to(
    mailchimpAPI.getInterestById(id, categoryId)
  );
  return interest;
}

async function interests(_, __, { dataSources: { mailchimpAPI } }) {
  const [err, interests] = await to(mailchimpAPI.getAllInterests());
  return interests;
}

export default {
  Query: {
    interest,
    interests
  }
};
