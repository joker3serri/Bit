import { AutoEnrollService as AutoEnrollServiceAbstraction } from "./auto-enroll.service.abstraction";

export class AutoEnrollService implements AutoEnrollServiceAbstraction {
  async enrollWithTde(): Promise<void> {
    // To something
  }
}
