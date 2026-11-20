export async function withinDeadline(check: (signal: AbortSignal) => Promise<void>, milliseconds: number) {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('Readiness probe timed out'));
          controller.abort();
        }, milliseconds);
      }),
      check(controller.signal),
    ]);
    return 'ready';
  } catch {
    return 'unavailable';
  } finally {
    clearTimeout(timer);
  }
}
