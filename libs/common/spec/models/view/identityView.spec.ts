import { IdentityView } from "@bitwarden/common/models/view/identityView";

describe("IdentityView", () => {
  it("fromJSON initializes new view object", () => {
    const testValues = {
      title: "Mr",
      firstName: "First",
      middleName: "Middle",
      lastName: "Last",
      address1: "123",
      address2: "Fake St",
      address3: "Business Park",
      city: "Sydney",
      state: "NSW",
      postalCode: "2000",
      country: "Australia",
      company: "Bitwarden",
      email: "example@ex.com",
      phone: "1234",
      ssn: "09876",
      username: "myUsername0",
      passportNumber: "A12387",
      licenseNumber: "asdf",
    };

    const actual = IdentityView.fromJSON(testValues);

    const expected = Object.assign(new IdentityView(), testValues);
    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(IdentityView);
  });
});
