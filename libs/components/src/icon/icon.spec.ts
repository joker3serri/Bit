import * as IconExports from "./icon";
import { DynamicContentNotAllowedError, svgIcon } from "./icon";

describe("Icon", () => {
  it("exports should not expose Icon class", () => {
    expect(Object.keys(IconExports)).not.toContain("Icon");
  });

  describe("template literal", () => {
    it("should throw when attempting to create dynamic icons", () => {
      const dynamic = "some user input";

      const f = () => svgIcon`static and ${dynamic}`;

      expect(f).toThrow(DynamicContentNotAllowedError);
    });

    it("should return icon with supplied svg string", () => {
      const icon = svgIcon`safe static content`;

      expect(icon.svg).toBe("safe static content");
    });
  });
});
