/**
 * Coalesces high-frequency updates (e.g. pointermove) into at most one call per
 * animation frame. Multiple `schedule()` calls before the frame fires are collapsed
 * into a single `process()` call using the most recent data.
 *
 * `setProcess` lets the callback be swapped in place (e.g. from an effect that keeps
 * it in sync with the latest render's closure) without recreating the batcher itself.
 */
export function createRafBatcher<T>(initialProcess: (data: T) => void) {
  let process = initialProcess;
  let rafId: number | null = null;
  let pending: T | null = null;

  const schedule = (data: T) => {
    pending = data;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const data2 = pending;
      pending = null;
      if (data2 !== null) process(data2);
    });
  };

  const cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    pending = null;
  };

  const setProcess = (next: (data: T) => void) => {
    process = next;
  };

  return { schedule, cancel, setProcess };
}
