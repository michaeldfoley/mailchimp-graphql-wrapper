import memberReducer from "../mailchimp.member.reducer";

describe("[MailchimpAPI.memberReducer]", () => {
  it("transforms member", () => {
    expect(memberReducer(mockMemberResponse)).toEqual(mockMember);
  });
});

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
