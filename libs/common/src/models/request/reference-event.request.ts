export type InitiationPath =
  | "Registration form"
  | "Trial from marketing website"
  | "New organization creation in-product"
  | "Upgrade in-product";

export class ReferenceEventRequest {
  id: string;
  session: string;
  layout: string;
  flow: string;
  initiationPath: InitiationPath;
}
