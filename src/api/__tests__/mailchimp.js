import MailchimpAPI from "../mailchimp";

const MOCK_API_KEY = "ABC123-us1";
const MOCK_LIST_ID = "1a23";

const mocks = {
  get: jest.fn(),
  patch: jest.fn()
};

const ds = new MailchimpAPI(MOCK_API_KEY, MOCK_LIST_ID);
ds.get = mocks.get;
ds.patch = mocks.patch;

describe("[MailchimpAPI.constructor]", () => {
  it("throws error when empty or invalid api is passed", () => {
    expect(() => new MailchimpAPI("ABC")).toThrow(Error);
    expect(() => new MailchimpAPI()).toThrow(Error);
  });
});

describe("[MailchimpAPI.fieldToArray]", () => {
  it("transforms field to array", () => {
    expect(ds.fieldToArray("^a^,^b^,^c^")).toEqual(["a", "b", "c"]);
    expect(ds.fieldToArray("^^")).toEqual([]);
  });
});

describe("[MailchimpAPI.memberReducer]", () => {
  it("transforms member", () => {
    expect(ds.memberReducer(mockMemberResponse)).toEqual(mockMember);
  });
});

describe("[MailchimpAPI.interestReducer]", () => {
  it("transforms interest", () => {
    expect(ds.interestReducer(mockInterestResponse)).toEqual(mockInterest);
  });
});

describe("[MailchimpAPI.getMemberById]", () => {
  it("should get member by id", async () => {
    mocks.get.mockReturnValueOnce(mockMemberResponse);

    const res = await ds.getMemberById("b642b4217b34b1e8d3bd915fc65c4452");
    expect(res).toEqual(mockMember);
    expect(mocks.get).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        fields: [
          "id",
          "email_address",
          "email_type",
          "status",
          "merge_fields",
          "interests"
        ]
      }
    );
  });
});

describe("[MailchimpAPI.patchMember]", () => {
  it("should send update and return member", async () => {
    mocks.patch.mockReturnValueOnce(mockMemberResponse);

    const res = await ds.patchMember("b642b4217b34b1e8d3bd915fc65c4452", {
      email_address: "test2@test.com",
      status: "unsubscribed"
    });
    expect(res).toEqual(mockMember);
    expect(mocks.patch).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/members/b642b4217b34b1e8d3bd915fc65c4452`,
      {
        email_address: "test2@test.com",
        status: "unsubscribed"
      }
    );
  });
});

describe("[MailchimpAPI.getInterestById]", () => {
  it("should get an interest by id and category id", async () => {
    mocks.get.mockReturnValueOnce(mockInterestResponse);

    const res = await ds.getInterestById("fjkd453", "44rr43");
    expect(res).toEqual(mockInterest);
    expect(mocks.get).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/interest-categories/44rr43/interests/fjkd453`,
      {
        fields: ["id", "category_id", "name", "subscriber_count"]
      }
    );
  });
});

describe("[MailchimpAPI.getAllInterests]", () => {
  it("should get a flat array of interests", async () => {
    // temporarily mock get interest category functions
    const temp = {
      getInterestCategories: ds.getInterestCategories,
      getInterestsByCategory: ds.getInterestsByCategory
    };
    ds.getInterestCategories = jest.fn();
    ds.getInterestsByCategory = jest.fn();

    ds.getInterestCategories.mockReturnValueOnce(
      mockInterestCategoriesResponse["categories"]
    );
    ds.getInterestsByCategory
      .mockReturnValueOnce(mockInterestsByCategory1)
      .mockReturnValueOnce(mockInterestsByCategory2);

    const res = await ds.getAllInterests();
    expect(res).toEqual([
      ...mockInterestsByCategory1,
      ...mockInterestsByCategory2
    ]);

    // restore get interest category functions
    ds.getInterestCategories = temp.getInterestCategories;
    ds.getInterestsByCategory = temp.getInterestsByCategory;
  });
});

describe("[MailchimpAPI.getInterestCategories]", () => {
  it("should get an array of interest categories", async () => {
    mocks.get.mockReturnValueOnce(mockInterestCategoriesResponse);

    const res = await ds.getInterestCategories();
    expect(res).toEqual(mockInterestCategoriesResponse["categories"]);
  });
});

describe("[MailchimpAPI.getInterestsByCategory]", () => {
  it("should get an array interests by category id", async () => {
    mocks.get.mockReturnValueOnce(mockInterestsByCategoryResponse1);

    const res = await ds.getInterestsByCategory("44rr43");
    expect(res).toEqual(mockInterestsByCategory1);
    expect(mocks.get).toBeCalledWith(
      `lists/${MOCK_LIST_ID}/interest-categories/44rr43/interests`,
      {
        fields: [
          "interests.id",
          "interests.category_id",
          "interests.name",
          "interests.subscriber_count"
        ],
        count: 60
      },
      {
        cacheOptions: { ttl: 3600 }
      }
    );
  });
});

/**
 * MOCK MEMBER DATA
 */

// Transformed member data
const mockMember = {
  id: "b642b4217b34b1e8d3bd915fc65c4452",
  email: "test@test.com",
  emailType: "html",
  status: "subscribed",
  firstName: "Lucy",
  lastName: "Foley",
  fidn: "P001234",
  roles: ["DOG", "PET", "ANIMAL"],
  interests: ["fjkd453", "e392hk", "skd9h"],
  exclusions: ["NON", "EER"],
  recipientId: "ajs94330fs"
};

// Raw response from API
const mockMemberResponse = {
  id: "b642b4217b34b1e8d3bd915fc65c4452",
  email_address: "test@test.com",
  email_type: "html",
  status: "subscribed",
  merge_fields: {
    FNAME: "Lucy",
    LNAME: "Foley",
    FIDN: "P001234",
    IMCID: "ajs94330fs",
    SCHOOL: "AB",
    YEAR: "2019",
    ROLE: "^DOG^,^PET^,^ANIMAL^",
    EXCLUSION: "^NON^,^EER^"
  },
  interests: {
    "854dk03": false,
    cjijfkd: false,
    fjkd453: true,
    "77ccs7s": false,
    e392hk: true,
    "8ksjhd": false,
    skd9h: true
  }
};

/**
 * MOCK MEMBER DATA
 */

// Transformed member data
const mockInterest = {
  id: "fjkd453",
  categoryId: "44rr43",
  name: "Test Category",
  count: "10"
};

const mockInterestsByCategory1 = [
  {
    id: "fjkd453",
    categoryId: "44rr43",
    name: "Test Category",
    count: "10"
  },
  {
    id: "854dk03",
    categoryId: "44rr43",
    name: "Test Category 2",
    count: "45"
  },
  {
    id: "cjijfkd",
    categoryId: "44rr43",
    name: "Test Category 3",
    count: "1"
  },
  {
    id: "77ccs7s",
    categoryId: "44rr43",
    name: "Test Category 4",
    count: "1203"
  }
];

const mockInterestsByCategory2 = [
  {
    id: "e392hk",
    categoryId: "r5ewui",
    name: "Test Category 5",
    count: "1033"
  },
  {
    id: "8ksjhd",
    categoryId: "r5ewui",
    name: "Test Category 6",
    count: "4544"
  },
  {
    id: "skd9h",
    categoryId: "r5ewui",
    name: "Test Category 7",
    count: "4954"
  }
];

// Raw response from API
const mockInterestResponse = {
  category_id: "44rr43",
  id: "fjkd453",
  name: "Test Category",
  subscriber_count: "10"
};

const mockInterestCategoriesResponse = {
  categories: [{ id: "44rr43" }, { id: "dsjka5" }]
};

const mockInterestsByCategoryResponse1 = {
  interests: [
    {
      category_id: "44rr43",
      id: "fjkd453",
      name: "Test Category",
      subscriber_count: "10"
    },
    {
      category_id: "44rr43",
      id: "854dk03",
      name: "Test Category 2",
      subscriber_count: "45"
    },
    {
      category_id: "44rr43",
      id: "cjijfkd",
      name: "Test Category 3",
      subscriber_count: "1"
    },
    {
      category_id: "44rr43",
      id: "77ccs7s",
      name: "Test Category 4",
      subscriber_count: "1203"
    }
  ]
};

const mockInterestsByCategoryResponse2 = {
  interests: [
    {
      category_id: "r5ewui",
      id: "e392hk",
      name: "Test Category 5",
      subscriber_count: "1033"
    },
    {
      category_id: "r5ewui",
      id: "8ksjhd",
      name: "Test Category 6",
      subscriber_count: "4544"
    },
    {
      category_id: "r5ewui",
      id: "skd9h",
      name: "Test Category 7",
      subscriber_count: "4954"
    }
  ]
};
