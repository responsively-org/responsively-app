import * as Sentry from '@sentry/electron';

export const captureOnSentry = err => {
  console.log('err', err);
  if (process.env.NODE_ENV !== 'development') {
    Sentry.captureException(err);
  }
};
