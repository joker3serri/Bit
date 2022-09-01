import * as IconExports from "./icon";

describe("Icon", () => {
  it("exports should not expose Icon class", () => {
    expect(Object.keys(IconExports)).not.toContain("Icon");
  });
});
