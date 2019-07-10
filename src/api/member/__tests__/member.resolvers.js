import resolvers, { ___GET_ID } from "../member.resolvers";
import md5 from "md5";

const mockContext = {
  dataSources: {
    mailchimpAPI: {
      getAllInterests: jest.fn(),
      getMember: jest.fn(),
      patchMember: jest.fn()
    }
  },
  helpers: {
    md5
  }
};

describe("[Member.interests]", () => {
  it("looks up interests from mailchimp api", async () => {
    const { getAllInterests } = mockContext.dataSources.mailchimpAPI;
    getAllInterests.mockReturnValueOnce([
      {
        id: "9ab9"
      },
      {
        id: "c8shd"
      }
    ]);

    const res = await resolvers.Member.interests(
      { interests: ["9ab9"] },
      null,
      mockContext
    );
    expect(res).toEqual([
      {
        id: "9ab9"
      }
    ]);
  });
});

describe("[Query.member]", () => {
  const { getMember } = mockContext.dataSources.mailchimpAPI;

  it("converts email to id", async () => {
    getMember.mockReturnValueOnce({
      id: "b642b4217b34b1e8d3bd915fc65c4452"
    });

    await resolvers.Query.member(
      null,
      { input: { email: "test@test.com" } },
      mockContext
    );
    expect(getMember).toBeCalledWith("b642b4217b34b1e8d3bd915fc65c4452");
  });

  it("calls lookup from mailchimp api", async () => {
    getMember.mockReturnValueOnce({
      id: "b642b4217b34b1e8d3bd915fc65c4452"
    });

    const res = await resolvers.Query.member(
      null,
      { input: { id: "b642b4217b34b1e8d3bd915fc65c4452" } },
      mockContext
    );
    expect(res).toEqual({
      id: "b642b4217b34b1e8d3bd915fc65c4452"
    });
  });

  it("throws error when neither id or email is passed", async () => {
    const res = () => ___GET_ID(null, null, md5);
    expect(res).toThrow(Error);
  });

  it("throws error when member is not found", async () => {
    const res = async () =>
      await resolvers.Query.member(
        null,
        { input: { id: "1234" } },
        mockContext
      );
    expect(res()).rejects.toThrow(Error);
  });
});

describe("[Mutation.updateMember]", () => {
  const { patchMember } = mockContext.dataSources.mailchimpAPI;

  it("returns an updated member", async () => {
    patchMember.mockReturnValueOnce({
      id: "f2c97b1f2d2898cd2d6466ce95d4ba33",
      email: "test2@test.com",
      interests: ["9ab9"],
      status: "unsubscribed"
    });

    const res = await resolvers.Mutation.updateMember(
      null,
      {
        input: {
          id: "b642b4217b34b1e8d3bd915fc65c4452",
          email: "test2@test.com",
          interests: [
            { id: "9ab9", subscribed: true },
            { id: "abcd", subscribed: false }
          ],
          status: "unsubscribed"
        }
      },
      mockContext
    );
    expect(res).toEqual({
      id: "f2c97b1f2d2898cd2d6466ce95d4ba33",
      email: "test2@test.com",
      interests: ["9ab9"],
      status: "unsubscribed"
    });
    expect(patchMember).toBeCalledWith("b642b4217b34b1e8d3bd915fc65c4452", {
      email_address: "test2@test.com",
      interests: { "9ab9": true, abcd: false },
      status: "unsubscribed"
    });
  });

  it("payload does not include email_address", async () => {
    patchMember.mockReturnValueOnce({
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      email: "test@test.com",
      interests: ["9ab9"],
      status: "subscribed"
    });

    await resolvers.Mutation.updateMember(
      null,
      {
        input: {
          id: "b642b4217b34b1e8d3bd915fc65c4452",
          interests: [
            { id: "9ab9", subscribed: true },
            { id: "abcd", subscribed: false }
          ],
          status: "subscribed"
        }
      },
      mockContext
    );

    expect(patchMember).toBeCalledWith("b642b4217b34b1e8d3bd915fc65c4452", {
      interests: { "9ab9": true, abcd: false },
      status: "subscribed"
    });
  });
});

describe("[Mutation.unsubscribeMember]", () => {
  const { patchMember } = mockContext.dataSources.mailchimpAPI;

  it("converts email to id", async () => {
    patchMember.mockReturnValueOnce({
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      status: "unsubscribed"
    });

    await resolvers.Mutation.unsubscribeMember(
      null,
      { input: { email: "test@test.com" } },
      mockContext
    );
    expect(patchMember).toBeCalledWith("b642b4217b34b1e8d3bd915fc65c4452", {
      status: "unsubscribed"
    });
  });

  it("returns an unsubscribed member", async () => {
    patchMember.mockReturnValueOnce({
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      status: "unsubscribed"
    });

    const res = await resolvers.Mutation.unsubscribeMember(
      null,
      { input: { id: "b642b4217b34b1e8d3bd915fc65c4452" } },
      mockContext
    );
    expect(res).toEqual({
      id: "b642b4217b34b1e8d3bd915fc65c4452",
      status: "unsubscribed"
    });
  });
});
