import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OrderEmailErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface OrderEmailErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

class OrderEmailErrorBoundary extends React.Component<
  OrderEmailErrorBoundaryProps,
  OrderEmailErrorBoundaryState
> {
  constructor(props: OrderEmailErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): OrderEmailErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log email component errors specifically
    console.error('Email component error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Email Feature Unavailable</AlertTitle>
            <AlertDescription className="mt-2">
              The email functionality is temporarily unavailable. You can still view and manage orders.
            </AlertDescription>
            <Button 
              onClick={this.retry} 
              className="mt-4"
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default OrderEmailErrorBoundary;