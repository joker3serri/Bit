export class AdminAuthRequestStorable {
  id: string;
  privateKey: string;

  constructor(init?: Partial<AdminAuthRequestStorable>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  static fromJSON(obj: Partial<AdminAuthRequestStorable>): AdminAuthRequestStorable {
    if (obj == null) {
      return null;
    }

    return new AdminAuthRequestStorable(obj);
  }
}
