const CAPTURE_ATTEMPTS = 3;
const CAPTURE_RETRY_DELAY_MS = 250;

export const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const captureViewport = async (contents: Electron.WebContents) => {
  let lastError: unknown;
  let image: Electron.NativeImage | undefined;
  for (let attempt = 0; attempt < CAPTURE_ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      await delay(CAPTURE_RETRY_DELAY_MS);
    }
    try {
      image = await contents.capturePage();
      lastError = undefined;
      if (!image.isEmpty()) {
        return image;
      }
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError !== undefined) {
    throw lastError;
  }
  return image;
};
