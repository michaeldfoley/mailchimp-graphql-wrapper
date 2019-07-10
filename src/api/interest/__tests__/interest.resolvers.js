import resolvers from "../interest.resolvers";

describe("[Query.interest]", () => {
  const mockContext = {
    dataSources: {
      mailchimpAPI: { getInterest: jest.fn() }
    }
  };
  it("calls lookup from mailchimp api", async () => {
    const { getInterest } = mockContext.dataSources.mailchimpAPI;
    getInterest.mockReturnValueOnce({
      id: "9ab9",
      name: "Interest Name",
      categoryId: "1zz2",
      count: 2
    });

    // check the resolver response
    const res = await resolvers.Query.interest(
      null,
      { input: { id: "9ab9", categoryId: "1zz2" } },
      mockContext
    );
    expect(res).toEqual({
      id: "9ab9",
      name: "Interest Name",
      categoryId: "1zz2",
      count: 2
    });

    // make sure the dataSources were called properly
    expect(getInterest).toBeCalledWith("9ab9", "1zz2");
  });
});

describe("[Query.interests]", () => {
  const mockContext = {
    dataSources: {
      mailchimpAPI: { getAllInterests: jest.fn() }
    }
  };
  it("calls lookup from mailchimp api", async () => {
    const { getAllInterests } = mockContext.dataSources.mailchimpAPI;
    getAllInterests.mockReturnValueOnce([
      {
        id: "9ab9",
        name: "Interest Name",
        categoryId: "1zz2",
        count: 2
      }
    ]);

    // check the resolver response
    const res = await resolvers.Query.interests(null, null, mockContext);
    expect(res).toEqual([
      {
        id: "9ab9",
        name: "Interest Name",
        categoryId: "1zz2",
        count: 2
      }
    ]);
  });
});
