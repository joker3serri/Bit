import { FieldType } from "@bitwarden/common/enums/fieldType";
import { LoginLinkedId } from "@bitwarden/common/enums/linkedIdType";
import { FieldView } from "@bitwarden/common/models/view/fieldView";

describe("FieldView", () => {
  it("fromJSON initializes new view object", () => {
    const testValues = {
      name: "myFieldName",
      value: "myValue",
      type: FieldType.Hidden,
      newField: true,
      showValue: true,
      showCount: true,
      linkedId: LoginLinkedId.Password,
    };

    const actual = FieldView.fromJSON(testValues);

    const expected = Object.assign(new FieldView(), testValues);
    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(FieldView);
  });
});
