import { useEffect, useState } from "react";

/**
 * A custom hook that can be used in a component to throw an error asynchronously.
 * When called, it causes the component to re-render with an error.
 * This error will be caught by any error boundary higher in the component tree.
 *
 * @returns {Function} The throwAsyncError function which can be called with an error.
 */
const useThrowAsyncError = (): ((error: any) => void) => {
	const [error, setError] = useState(null);

	useEffect(() => {
		if (error) {
			throw error;
		}
	}, [error]);

	const throwAsyncError = (error: any) => setError(error);

	return throwAsyncError;
};

export default useThrowAsyncError;
