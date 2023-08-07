interface BrowserPopoutWindowService {
  openUnlockPrompt(senderWindowId: number): Promise<void>;
  closeUnlockPrompt(): Promise<void>;
  openPasswordRepromptPrompt(
    senderWindowId: number,
    promptData: {
      cipherId: string;
      senderTabId: number;
      action: string;
    }
  ): Promise<void>;
  closePasswordRepromptPrompt(): Promise<void>;
}

export { BrowserPopoutWindowService };
