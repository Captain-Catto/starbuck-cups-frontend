"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="m-0 flex min-h-screen items-center justify-center bg-zinc-950 font-sans text-white">
        <div className="max-w-[480px] p-8 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-zinc-900 text-[1.75rem]">
            ☕
          </div>
          <h1 className="mb-3 text-2xl font-bold">
            Có lỗi xảy ra
          </h1>
          <p className="mb-8 leading-relaxed text-gray-400">
            Trang web đang gặp sự cố. Vui lòng thử lại hoặc quay về trang chủ.
          </p>
          <div className="flex justify-center gap-4">
            <button type="button"
              onClick={reset}
              className="cursor-pointer rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white"
            >
              Thử lại
            </button>
            <Link
              href="/"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-2.5 font-semibold text-white no-underline"
            >
              Trang chủ
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
