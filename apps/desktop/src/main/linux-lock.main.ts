import { sessionBus } from "dbus-next";

import { Main } from "../main";

type DbusInterface = {
  service: string;
  objectPath: string;
  interfaceName: string;
};

type InterfaceBinding = {
  interface: DbusInterface;
  signal: string;
  validData: (msg: any) => boolean;
};

const listeners: InterfaceBinding[] = [
  {
    interface: {
      service: "org.freedesktop.ScreenSaver",
      objectPath: "/org/freedesktop/ScreenSaver",
      interfaceName: "org.freedesktop.ScreenSaver",
    },
    signal: "ActiveChanged",
    validData: (msg: any) => msg,
  },
  {
    interface: {
      service: "org.cinnamon.ScreenSaver",
      objectPath: "/org/cinnamon/ScreenSaver",
      interfaceName: "org.cinnamon.ScreenSaver",
    },
    signal: "ActiveChanged",
    validData: (msg: any) => msg,
  },
  {
    interface: {
      service: "org.gnome.ScreenSaver",
      objectPath: "/org/gnome/ScreenSaver",
      interfaceName: "org.gnome.ScreenSaver",
    },
    signal: "ActiveChanged",
    validData: (msg: any) => true,
  },
  {
    interface: {
      service: "org.gnome.SessionManager",
      objectPath: "/org/gnome/SessionManager/Presence",
      interfaceName: "org.gnome.SessionManager.Presence",
    },
    signal: "ActiveChanged",
    validData: (msg: any) => msg != 0,
  },
  {
    interface: {
      service: "org.xfce.ScreenSaver",
      objectPath: "/org/freedesktop/login1",
      interfaceName: "org.xfce.ScreenSaver",
    },
    signal: "ActiveChanged",
    validData: (msg: any) => true,
  },
  {
    interface: {
      service: "com.canonical.Unity",
      objectPath: "/com/canonical/Unity/Session",
      interfaceName: "com.canonical.Unity.Session",
    },
    signal: "Locked",
    validData: (msg: any) => true,
  },
];

export class LinuxLockMain {
  constructor(private main: Main) {}

  async init() {
    if (process.platform === "linux") {
      const sessBus = sessionBus();

      for (const listener of listeners) {
        const { service, interfaceName, objectPath } = listener.interface;
        try {
          const obj = await sessBus.getProxyObject(service, objectPath);
          try {
            const iface = obj.getInterface(interfaceName);
            iface.on(listener.signal, (changed) => {
              if (listener.validData(changed)) {
                this.main.messagingService.send("systemLocked");
              }
            });
          } catch (e) {
            // ignore non existent interface
          }
        } catch (e) {
          // ignore non existent object
        }
      }
    }
  }
}
