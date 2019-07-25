import interestReducer from "../mailchimp.interest.reducer";

describe("[MailchimpAPI.interestReducer]", () => {
  it("transforms interest", () => {
    expect(interestReducer(mockInterestResponse)).toEqual(mockInterest);
  });
});

const mockInterestResponse = {
  category_id: "44rr43",
  id: "fjkd453",
  name: "Test Category",
  subscriber_count: "10"
};

const mockInterest = {
  id: "fjkd453",
  categoryId: "44rr43",
  name: "Test Category",
  count: "10"
};
