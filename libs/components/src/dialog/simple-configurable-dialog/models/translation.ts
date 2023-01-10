export interface Translation {
  key: string;
  placeholders?: Array<string | number>;
}

export function isTranslation(obj: any): obj is Translation {
  return (
    typeof obj === "object" &&
    typeof obj.key === "string" &&
    (obj.placeholders === undefined || Array.isArray(obj.placeholders))
  );
}
