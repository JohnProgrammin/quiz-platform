import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-danger" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2 text-center">
              Something went wrong
            </h1>
            <p className="text-slate text-center mb-6">
              We're sorry! An unexpected error occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-red-50 rounded-lg">
                <summary className="cursor-pointer font-bold text-danger mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-danger overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                Refresh Page
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 px-4 py-2 border-2 border-slate-200 text-slate font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
