
// Uncomment the following lines when Sentry is set up
// import * as Sentry from '@sentry/browser'; 

export default class GlobalErrorService {
  public static handleError(error: Error | Event, errorInfo?: object): void {
    console.error('Global error handler:', error, errorInfo);
  
    // Sentry.captureException(error);
    // Sentry.captureException({ error, errorInfo }); ?
  }

  public static handlePromiseRejection(reason: any): void {
    console.error('Global unhandled promise rejection handler:', reason);

    // Sentry.captureException(reason);
  }

  public static handleReduxError(error: Error): void {
    console.error('Global Redux error handler:', error);

    // Sentry.captureException(error);
  }
}
