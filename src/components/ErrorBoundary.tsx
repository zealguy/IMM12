import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {this.props.fallbackTitle || 'Something went wrong displaying this section.'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              {this.state.error?.message || 'An unexpected rendering error occurred. The application remains active.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
