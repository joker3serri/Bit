import { CardView } from "@bitwarden/common/models/view/cardView";

describe("CardView", () => {
  it("fromJSON initializes new view object", () => {
    const testValues = {
      cardholderName: "my cardholder name",
      expMonth: "08",
      expYear: "2030",
      code: "123",
      brand: "ExampleCard Co",
      number: "1234 5678 9101",
    };

    const actual = CardView.fromJSON(testValues);

    const expected = Object.assign(new CardView(), testValues);
    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(CardView);
  });
});
