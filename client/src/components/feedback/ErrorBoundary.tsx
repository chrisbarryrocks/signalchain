import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught render error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-500/[0.08] px-6 py-5">
            <p className="text-sm font-semibold text-rose-300">Something went wrong</p>
            <p className="mt-2 text-xs leading-relaxed text-rose-300/70">
              {this.state.error.message || "An unexpected error occurred. Reload the page to try again."}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
