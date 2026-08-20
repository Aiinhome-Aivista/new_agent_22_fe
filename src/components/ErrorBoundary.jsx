import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
          <div className="bg-red-50 text-red-700 p-8 rounded-2xl max-w-lg shadow-sm border border-red-100">
            <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
            <p className="text-sm mb-6">An unexpected error occurred while rendering this page.</p>
            <pre className="text-xs text-left bg-white p-4 rounded overflow-x-auto text-red-900 border border-red-200 mb-6">
              {this.state.error && this.state.error.toString()}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold shadow transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
