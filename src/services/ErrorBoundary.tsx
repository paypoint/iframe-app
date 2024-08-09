import React, { ErrorInfo } from "react";

interface ErrorBoundaryProps {
  onError: (error: Error, errorInfo: ErrorInfo) => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Call the onError function provided in props
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return null or a minimal error UI if needed
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
