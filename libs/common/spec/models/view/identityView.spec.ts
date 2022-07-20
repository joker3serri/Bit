import { IdentityView } from "@bitwarden/common/models/view/identityView";

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

describe("IdentityView", () => {
  it("toJSON creates object for serialization", () => {
    const identity = new IdentityView();
    Object.assign(identity, testValues);

    const actual = identity.toJSON();

    expect(actual).toEqual(testValues);
  });

  it("fromJSON initializes new view object", () => {
    const actual = IdentityView.fromJSON(testValues);

    const expected = new IdentityView();
    Object.assign(expected, testValues);

    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(IdentityView);
  });
});
