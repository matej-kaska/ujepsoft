import { Component, ErrorInfo, ReactNode } from "react";
import SomethingWentWrong from "./SomethingWentWrong";
import GlobalErrorService from "./GlobalErrorService";
import { connect } from 'react-redux';
import { RootState } from '../../redux/store';

interface State {
  hasError: boolean;
  error?: Error;
}

interface StateProps {
  reduxError: string | null;
}

interface Props extends StateProps {
  children: ReactNode;
}

/**
 * A component that catches JavaScript errors anywhere in child component tree.
 * This has to be a class component in order to use componentDidCatch lifecycle method
 * that will be connected to error reporting service.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  // eslint-disable-next-line
  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
    GlobalErrorService.handleError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.reduxError && !prevProps.reduxError) {
      this.setState({ hasError: true });
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return <SomethingWentWrong />;
    }

    return this.props.children;
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  return {
    reduxError: state.error.message,
  }
}

export default connect(mapStateToProps)(ErrorBoundary);
