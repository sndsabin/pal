import { Component, ReactNode } from "react";

import ErrorPage from "../pages/ErrorPage";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
    retryCount: 0,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  handleRetry = () => {
    // first time: clear the error, and increase the retry count
    // reload the app if it's not the first time

    if (this.state.retryCount >= 1) {
      window.location.reload();
      return;
    }

    this.setState({ error: null, retryCount: this.state.retryCount + 1 });
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorPage
          error={this.state.error.message || "An unexpected error occured."}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
