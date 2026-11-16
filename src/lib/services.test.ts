import { describe, expect, it } from "vitest";
import { searchServices, services, slugify, categoryBySlug } from "./services";

describe("services", () => {
  it("ranks exact name match first", () => {
    expect(searchServices(services, "netflix")[0]?.id).toBe("netflix");
  });
  it("round-trips category slugs", () => {
    expect(categoryBySlug(slugify("Work & tools"))).toBe("Work & tools");
  });
});
