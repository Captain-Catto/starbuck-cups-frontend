"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  messages?: {
    title: string;
    description: string;
    retry: string;
    detailLabel: string;
  };
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const messages = this.props.messages ?? {
        title: "Something went wrong",
        description:
          "An unexpected error occurred. Please try again or contact support if the issue persists.",
        retry: "Reload page",
        detailLabel: "Error details (development only)",
      };

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="size-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="size-8 text-red-400" />
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">
              {messages.title}
            </h2>

            <p className="text-zinc-400 mb-6">
              {messages.description}
            </p>

            <button type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <RefreshCw className="size-4" />
              {messages.retry}
            </button>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300">
                  {messages.detailLabel}
                </summary>
                <pre className="mt-2 p-4 bg-zinc-900 rounded text-xs overflow-auto text-red-400">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
