import { Component, NgZone, ViewChild, ViewContainerRef } from "@angular/core";

import { SendComponent as BaseSendComponent } from "@bitwarden/angular/src/components/send/send.component";
import { ModalService } from "@bitwarden/angular/src/services/modal.service";
import { BroadcasterService } from "@bitwarden/common/src/abstractions/broadcaster.service";
import { EnvironmentService } from "@bitwarden/common/src/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/src/abstractions/policy.service";
import { SearchService } from "@bitwarden/common/src/abstractions/search.service";
import { SendService } from "@bitwarden/common/src/abstractions/send.service";
import { SendView } from "@bitwarden/common/src/models/view/sendView";

import { AddEditComponent } from "./add-edit.component";

const BroadcasterSubscriptionId = "SendComponent";

@Component({
  selector: "app-send",
  templateUrl: "send.component.html",
})
export class SendComponent extends BaseSendComponent {
  @ViewChild("sendAddEdit", { read: ViewContainerRef, static: true })
  sendAddEditModalRef: ViewContainerRef;

  constructor(
    sendService: SendService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    environmentService: EnvironmentService,
    ngZone: NgZone,
    searchService: SearchService,
    policyService: PolicyService,
    private modalService: ModalService,
    private broadcasterService: BroadcasterService,
    logService: LogService
  ) {
    super(
      sendService,
      i18nService,
      platformUtilsService,
      environmentService,
      ngZone,
      searchService,
      policyService,
      logService
    );
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.load();

    // Broadcaster subscription - load if sync completes in the background
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "syncCompleted":
            if (message.successfully) {
              await this.load();
            }
            break;
        }
      });
    });
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async addSend() {
    if (this.disableSend) {
      return;
    }

    const component = await this.editSend(null);
    component.type = this.type;
  }

  async editSend(send: SendView) {
    const [modal, childComponent] = await this.modalService.openViewRef(
      AddEditComponent,
      this.sendAddEditModalRef,
      (comp) => {
        comp.sendId = send == null ? null : send.id;
        comp.onSavedSend.subscribe(async () => {
          modal.close();
          await this.load();
        });
        comp.onDeletedSend.subscribe(async () => {
          modal.close();
          await this.load();
        });
      }
    );

    return childComponent;
  }
}
