const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,
      debug: false,
    });
  });
}

export const onRouterTransitionStart = (...args: unknown[]) => {
  if (!sentryDsn) return;

  void import("@sentry/nextjs").then((Sentry) => {
    const captureRouterTransitionStart =
      Sentry.captureRouterTransitionStart as (...handlerArgs: unknown[]) => void;

    captureRouterTransitionStart(...args);
  });
};
