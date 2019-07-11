import to from "../to";

describe("utils: to", () => {
  it("returns resolved promise", async () => {
    const mockPromise = Promise.resolve({ id: "abc" });
    const [err, res] = await to(mockPromise);
    expect(err).toBeNull();
    expect(res).toEqual({ id: "abc" });
  });

  it("returns data if not passed a promise", async () => {
    const mockPromise = { id: "abc" };
    const [err, res] = await to(mockPromise);
    expect(err).toBeNull();
    expect(res).toEqual({ id: "abc" });
  });

  it("returns error if ", async () => {
    const mockPromise = Promise.reject(new Error("something went"));
    const [err, res] = await to(mockPromise);
    expect(err).toBeInstanceOf(Error);
    expect(res).toBeUndefined();
  });
});
