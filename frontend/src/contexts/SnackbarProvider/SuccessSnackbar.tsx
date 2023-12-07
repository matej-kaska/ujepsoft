type SuccessSnackbarProps = {
  message: string;
  fade: string;
  closeSnackbar: () => void;
}

const SuccessSnackbar = ({ message, fade, closeSnackbar }: SuccessSnackbarProps) => (
  <div className={`success-snackbar z-50 fixed top-0 left-1/2 transform -translate-x-1/2 mt-8 max-w-auto whitespace-nowrap ${fade}`} onClick={closeSnackbar}>
    <div className="border-t-4 rounded-b p-green px-4 py-3 shadow-md">
      <div className="flex items-center">
        <p className="mr-2 text-white">{message}</p>
      </div>
    </div>
  </div>
)

export default SuccessSnackbar;
