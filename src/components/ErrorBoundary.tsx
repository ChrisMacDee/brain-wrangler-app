import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h1 className="text-xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="text-gray-300 mb-4">
              The app encountered an error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                  Error details
                </summary>
                <pre className="mt-2 text-xs bg-gray-900 p-3 rounded overflow-auto max-h-60 text-red-400">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
