import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ListResponse } from "@bitwarden/common/models/response/list.response";

import { MemberCipherDetailsResponse } from "../response/member-cipher-details.response";

export class MemberCipherDetailsApiService {
  constructor(private apiService: ApiService) {}

  async getMemberCipherDetails(orgId: string): Promise<MemberCipherDetailsResponse[]> {
    const response = await this.apiService.send(
      "GET",
      "/reports/member-cipher-details/" + orgId,
      null,
      true,
      true,
    );

    const listResponse = new ListResponse(response, MemberCipherDetailsResponse);
    return listResponse.data.map((r) => new MemberCipherDetailsResponse(r));
  }
}
