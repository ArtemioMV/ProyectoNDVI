import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names and removes empty values", () => {
    expect(cn("base", false, null, undefined, "active")).toBe("base active");
  });
});
