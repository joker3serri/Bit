import { CollectionAccessSelectionView } from "@bitwarden/admin-console/common";
import { View } from "@bitwarden/common/models/view/view";

import { GroupDetailsResponse, GroupResponse } from "../services/group/responses/group.response";

export class GroupDetailsView implements View {
  id: string;
  organizationId: string;
  name: string;
  externalId: string;
  collections: CollectionAccessSelectionView[] = [];

  static fromResponse(response: GroupResponse): GroupDetailsView {
    const view: GroupDetailsView = Object.assign(
      new GroupDetailsView(),
      response,
    ) as GroupDetailsView;

    if (response instanceof GroupDetailsResponse && response.collections != undefined) {
      view.collections = response.collections.map((c) => new CollectionAccessSelectionView(c));
    }

    return view;
  }
}
