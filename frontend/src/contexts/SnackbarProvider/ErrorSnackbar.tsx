type ErrorSnackbarProps = {
	message: string;
	fade: string;
	closeSnackbar: () => void;
};

const ErrorSnackbar = ({ message, fade, closeSnackbar }: ErrorSnackbarProps) => (
	<div className={`error-snackbar z-50 fixed top-0 left-1/2 transform -translate-x-1/2 mt-8 max-w-md whitespace-nowrap ${fade}`} onClick={closeSnackbar}>
		<div className="bg-red-100 border border-red-800 text-red-800 rounded relativ px-4 py-3 shadow-md">
			<div className="flex items-center">
				<p>{message}</p>
			</div>
		</div>
	</div>
);

export default ErrorSnackbar;
