export default class GlobalErrorService {
	public static handleError(error: Error | Event, errorInfo?: object): void {
		console.error("Global error handler:", error, errorInfo);
	}

	public static handlePromiseRejection(reason: any): void {
		console.error("Global unhandled promise rejection handler:", reason);
	}

	public static handleReduxError(error: Error): void {
		console.error("Global Redux error handler:", error);
	}
}
