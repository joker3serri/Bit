import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject } from "rxjs";

import { BrowserApi } from "../../browser/browserApi";
import { StateService } from "../../services/abstractions/state.service";

import { SessionSyncer } from "./session-syncer";

describe("session syncer", () => {
  const key = "Test__behaviorSubject";
  let stateService: SubstituteOf<StateService>;
  let sut: SessionSyncer;

  beforeEach(() => {
    jest.spyOn(chrome.runtime, "getManifest").mockReturnValue({
      name: "bitwarden-test",
      version: "0.0.0",
      manifest_version: 3,
    });

    stateService = Substitute.for<StateService>();
  });

  describe("initialization", () => {
    describe("input errors", () => {
      it("should throw if behaviorSubject is not an instance of BehaviorSubject", () => {
        expect(() => {
          new SessionSyncer({}, stateService, null);
        }).toThrowError("behaviorSubject must be an instance of BehaviorSubject");
      });

      describe("when BehaviorSubject is provided", () => {
        const behaviorSubject = new BehaviorSubject("");

        it("should create if behaviorSubject is an instance of BehaviorSubject", () => {
          new SessionSyncer(behaviorSubject, stateService, {
            key: key,
            ctor: String,
            initializer: (s: any) => s,
          });
        });

        it("should create if either ctor or initializer is provided", () => {
          new SessionSyncer(behaviorSubject, stateService, { key: key, ctor: String });
          new SessionSyncer(behaviorSubject, stateService, {
            key: key,
            initializer: (s: any) => s,
          });
        });

        it("should throw if neither ctor nor initializer is provided", () => {
          expect(() => {
            new SessionSyncer(behaviorSubject, stateService, { key: key });
          }).toThrowError("ctor or initializer must be provided");
        });
      });
    });
  });

  describe("successful initialize", () => {
    let behaviorSubject: BehaviorSubject<string>;

    beforeEach(() => {
      behaviorSubject = new BehaviorSubject("");

      sut = new SessionSyncer(behaviorSubject, stateService, {
        key: key,
        initializer: (s: any) => s,
      });
    });

    describe("init", () => {
      let observeSpy: jest.SpyInstance;
      let listenForUpdatesSpy: jest.SpyInstance;

      beforeEach(() => {
        observeSpy = jest.spyOn(sut, "observe").mockReturnValue();
        listenForUpdatesSpy = jest.spyOn(sut, "listenForUpdates").mockReturnValue();

        sut.init();
      });

      describe("manifest v3", () => {
        beforeEach(() => {
          sut.init();
        });

        it("should start observing", () => {
          expect(observeSpy).toHaveBeenCalled();
        });

        it("should start listening", () => {
          expect(listenForUpdatesSpy).toHaveBeenCalled();
        });
      });

      describe("not manifest v2", () => {
        beforeEach(() => {
          jest.resetAllMocks();
          jest.spyOn(chrome.runtime, "getManifest").mockReturnValue({
            name: "bitwarden-test",
            version: "0.0.0",
            manifest_version: 2,
          });

          sut.init();
        });

        it("should not start observing", () => {
          expect(observeSpy).not.toHaveBeenCalled();
        });

        it("should not start listening", () => {
          expect(listenForUpdatesSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe("observing", () => {
      const next = "test";
      let updateSessionSpy: jest.SpyInstance;

      beforeEach(() => {
        sut.init();

        updateSessionSpy = jest.spyOn(sut, "updateSession").mockResolvedValue();
        behaviorSubject.next(next);
      });

      it("should call updateSession", () => {
        expect(updateSessionSpy).toHaveBeenCalledTimes(1);
        expect(updateSessionSpy).toHaveBeenCalledWith(next);
      });
    });

    describe("updating session", () => {
      const next = "test";
      let sendMessageSpy: jest.SpyInstance;

      beforeEach(() => {
        sendMessageSpy = jest.spyOn(BrowserApi, "sendMessage");

        sut.init();
      });

      it("should call stateService.setInSessionMemory and send message", async () => {
        await sut.updateSession(next);
        stateService.received(1).setInSessionMemory(key, next);
        expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        expect(sendMessageSpy).toHaveBeenCalledWith(key + "_update", { id: sut.id });
      });
    });

    describe("listening for updates", () => {
      let listenForUpdatesSpy: jest.SpyInstance;

      beforeEach(() => {
        listenForUpdatesSpy = jest.spyOn(BrowserApi, "messageListener").mockReturnValue();
        sut.init();
      });

      it("should set listener", () => {
        expect(listenForUpdatesSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe("updateFromMessage", () => {
      const fromSession = "from session";
      let nextSpy: jest.SpyInstance;
      const command = "message_command";

      beforeEach(() => {
        jest.spyOn(sut as any, "updateMessageCommand", "get").mockReturnValue(command);
        stateService.getFromSessionMemory(key).resolves(fromSession);
        nextSpy = jest.spyOn(behaviorSubject, "next").mockReturnValue();
      });

      it("should ignore messages with the wrong command", () => {
        sut.updateFromMessage({ command: "some_other_command", id: "any_id" });
        stateService.didNotReceive().getFromSessionMemory(Arg.any());
      });

      it("should ignore a message from itself", () => {
        sut.updateFromMessage({ command: command, id: sut.id });
        stateService.didNotReceive().getFromSessionMemory(Arg.any());
      });

      it("should set behavior subject next", async () => {
        await sut.updateFromMessage({ command: command, id: "different Id" });
        stateService.received(1).getFromSessionMemory(key);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy).toHaveBeenCalledWith(fromSession);
      });
    });
  });

  describe("build from key value pair", () => {
    const key = "key";
    const initializer = (s: any) => "used initializer";
    class TestClass {}
    const ctor = TestClass;

    it("should call initializer if provided", () => {
      const actual = SessionSyncer.buildFromKeyValuePair(
        {},
        {
          key: key,
          initializer: initializer,
        }
      );

      expect(actual).toEqual("used initializer");
    });

    it("should call ctor if provided", () => {
      const expected = { provided: "value" };
      const actual = SessionSyncer.buildFromKeyValuePair(expected, {
        key: key,
        ctor: ctor,
      });

      expect(actual).toBeInstanceOf(ctor);
      expect(actual).toEqual(expect.objectContaining(expected));
    });

    it("should prefer using initializer if both are provided", () => {
      const actual = SessionSyncer.buildFromKeyValuePair(
        {},
        {
          key: key,
          initializer: initializer,
          ctor: ctor,
        }
      );

      expect(actual).toEqual("used initializer");
    });

    it("should honor initialize as array", () => {
      const actual = SessionSyncer.buildFromKeyValuePair([1, 2], {
        key: key,
        initializer: initializer,
        initializeAsArray: true,
      });

      expect(actual).toEqual(["used initializer", "used initializer"]);
    });
  });
});
