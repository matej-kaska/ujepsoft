type SuccessSnackbarProps = {
	message: string;
	fade: string;
	closeSnackbar: () => void;
};

const SuccessSnackbar = ({ message, fade, closeSnackbar }: SuccessSnackbarProps) => (
	<div className={`success-snackbar fixed top-0 max-w-auto whitespace-nowrap ${fade}`} onClick={closeSnackbar}>
		<div className="border-t-4 rounded-b p-green px-4 py-3 shadow-md">
			<div className="flex items-center">
				<p className="text-white">{message}</p>
			</div>
		</div>
	</div>
);

export default SuccessSnackbar;
