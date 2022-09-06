declare let console: any;
const originalConsole = console;

export function interceptConsole(interceptions: any): object {
  console = {
    log: function () {
      // eslint-disable-next-line
      interceptions.log = arguments;
    },
    warn: function () {
      // eslint-disable-next-line
      interceptions.warn = arguments;
    },
    error: function () {
      // eslint-disable-next-line
      interceptions.error = arguments;
    },
  };
  return interceptions;
}

export function restoreConsole() {
  console = originalConsole;
}
