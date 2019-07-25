export default function interestReducer(interest) {
  const { id, category_id, name, subscriber_count } = interest;
  return {
    id,
    categoryId: category_id,
    name,
    count: subscriber_count
  };
}
