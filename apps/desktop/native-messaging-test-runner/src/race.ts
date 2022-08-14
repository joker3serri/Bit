export const race = <T>({
  promise,
  timeout,
  error,
}: {
  promise: Promise<T>;
  timeout: number;
  error?: Error;
}) => {
  let timer = null;

  return Promise<T>.race([
    new Promise<T>((_, reject) => {
      timer = setTimeout(reject, timeout, error);
      return timer;
    }),

    promise.then((value) => {
      clearTimeout(timer);
      return value;
    }),
  ]);
};
