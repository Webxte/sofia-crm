
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, isRecovering: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Component error caught:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    this.setState({ isRecovering: true });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  render() {
    if (this.state.isRecovering) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <LoadingSpinner size="lg" message="Reloading application..." />
        </div>
      );
    }

    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-lg mb-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Application Error</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">Something went wrong with the application.</p>
              <p className="text-xs text-red-300 mb-4 font-mono">
                {this.state.error?.toString()}
              </p>
              <Button 
                onClick={this.handleReload}
                variant="outline" 
                size="sm"
                className="bg-white text-red-600 hover:bg-red-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Application
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
