/**
 * Creates a throttled function that only invokes `func` at most once per every `wait` milliseconds.
 * @param func The function to throttle.
 * @param wait The number of milliseconds to throttle invocations to.
 * @returns Returns the new throttled function.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    const context: any = this;

    const later = () => {
      lastTime = Date.now();
      timeoutId = null;
      func.apply(context, args);
    };

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastTime = now;
      func.apply(context, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(later, remaining);
    }
  };
}
