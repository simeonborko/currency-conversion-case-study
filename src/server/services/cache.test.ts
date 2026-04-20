import { TtlCache } from "./cache";

describe("TtlCache", () => {
  it("get returns null for missing key", () => {
    const cache = new TtlCache<string>(1000);
    expect(cache.get("missing")).toBeNull();
  });

  it("get returns value within TTL", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("key", "value");
    expect(cache.get("key")).toBe("value");
  });

  it("get returns null and evicts after TTL expires", async () => {
    const cache = new TtlCache<string>(100);
    cache.set("key", "value");
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(cache.get("key")).toBeNull();
  });

  it("set overwrites existing entry and resets TTL", async () => {
    const cache = new TtlCache<string>(200);
    cache.set("key", "value1");
    await new Promise((resolve) => setTimeout(resolve, 150));
    cache.set("key", "value2");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(cache.get("key")).toBe("value2");
  });
});
