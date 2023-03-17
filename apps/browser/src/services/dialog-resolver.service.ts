const DialogPromiseExpiration = 600000; // 10 minutes

/**
 * Service for resolving dialog promises when communicating between the popup and the background process.
 *
 * This is an ugly hack and we should rework this into a better solution.
 */
export class DialogResolverService {
  private showDialogResolves = new Map<number, { resolve: (value: boolean) => void; date: Date }>();

  await(dialogId: number) {
    return new Promise<boolean>((resolve) => {
      this.showDialogResolves.set(dialogId, { resolve: resolve, date: new Date() });
    });
  }

  resolveDialogPromise(dialogId: number, confirmed: boolean) {
    if (this.showDialogResolves.has(dialogId)) {
      const resolveObj = this.showDialogResolves.get(dialogId);
      resolveObj.resolve(confirmed);
      this.showDialogResolves.delete(dialogId);
    }

    // Clean up old promises
    this.showDialogResolves.forEach((val, key) => {
      const age = new Date().getTime() - val.date.getTime();
      if (age > DialogPromiseExpiration) {
        this.showDialogResolves.delete(key);
      }
    });
  }
}
